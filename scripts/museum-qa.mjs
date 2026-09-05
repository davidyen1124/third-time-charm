import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseURL =
  process.env.MUSEUM_QA_URL || 'http://127.0.0.1:4173/third-time-charm/'
const output = process.env.MUSEUM_QA_OUTPUT || 'museum-qa-results'
await fs.mkdir(output, { recursive: true })
const report = {
  url: baseURL,
  commit: process.env.QA_COMMIT,
  checks: [],
  screenshots: [],
  issues: [],
}
const browser = await chromium.launch({
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-dev-shm-usage',
  ],
})
const context = await browser.newContext({
  viewport: { width: 1487, height: 1058 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})
const page = await context.newPage()
page.setDefaultTimeout(20000)
const pending = new Set()
page.on('request', (request) => pending.add(request.url()))
page.on('requestfinished', (request) => pending.delete(request.url()))
page.on('requestfailed', (request) => pending.delete(request.url()))
page.on('pageerror', (error) =>
  report.issues.push({ type: 'pageerror', text: error.message })
)
page.on('console', (message) => {
  if (['error', 'warning'].includes(message.type()))
    report.issues.push({ type: message.type(), text: message.text() })
})
page.on('requestfailed', (request) => {
  if (!request.failure()?.errorText.includes('ERR_ABORTED'))
    report.issues.push({
      type: 'request',
      url: request.url(),
      text: request.failure()?.errorText,
    })
})
const screenshot = async (name, fullPage = false) => {
  await page.screenshot({
    path: path.join(output, `${name}.png`),
    fullPage,
    timeout: 60000,
  })
  report.screenshots.push(name)
}
const check = async (name, action) => {
  try {
    await action()
    report.checks.push({ name, passed: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message })
    console.error(`FAIL ${name}: ${error.message}`)
    await screenshot(`failure-${report.checks.length}`).catch(() => {})
  }
}
const expectVisible = async (locator) => {
  await locator.waitFor({ state: 'visible' })
  assert(await locator.isVisible())
}
const ready = async () => {
  await expectVisible(page.locator('.museum-shell'))
  await page
    .locator('.museum-loading')
    .waitFor({ state: 'hidden', timeout: 120000 })
  assert.equal(
    await page.locator('.museum-unavailable').count(),
    0,
    'The Three.js room did not start'
  )
  await expectVisible(page.locator('canvas'))
  await page.waitForTimeout(1200)
}
const button = (name) => page.getByRole('button', { name, exact: true })
const works = [
  ['lockedin', '01 Pink Prisoner'],
  ['hoverboard', '02 Hoverboard'],
  ['chromatic-gate', '03 Chromatic Gate'],
  ['car-physics', '04 Car Physics'],
  ['duck', '05 Rubber Ducks'],
  ['polaroid', '06 Spotlight Polaroids'],
  ['conveyor', '07 Grocery Conveyor'],
  ['techmap', '08 Tech Constellation'],
]
try {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await check('Production page renders a real WebGL 2 museum', async () => {
    assert.match(await page.title(), /Daylight Museum/)
    await ready()
    report.graphics = await page.locator('canvas').evaluate((canvas) => {
      const gl = canvas.getContext('webgl2'),
        info = gl.getExtension('WEBGL_debug_renderer_info')
      return {
        renderer: gl.getParameter(info.UNMASKED_RENDERER_WEBGL),
        width: canvas.width,
        height: canvas.height,
        error: gl.getError(),
      }
    })
    assert.equal(report.graphics.error, 0)
    assert(report.graphics.width > 1000 && report.graphics.height > 500)
    assert.equal(await page.locator('vite-error-overlay').count(), 0)
    await screenshot('desktop-overview')
  })
  assert(
    report.checks[0]?.passed,
    'Cannot continue artwork QA until the room renders'
  )
  await check('All eight thumbnails and local fonts load', async () => {
    const loaded = await page
      .locator('.catalogue-thumb img')
      .evaluateAll((images) =>
        images.map((image) => image.complete && image.naturalWidth > 0)
      )
    assert.equal(loaded.length, 8)
    assert(loaded.every(Boolean))
    assert(
      await page.evaluate(() => document.fonts.check('16px "Museum Caslon"'))
    )
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    )
  })
  await check(
    'All works dialog, keyboard dismissal, and focus return',
    async () => {
      await button('All works').click()
      await expectVisible(page.getByRole('dialog'))
      assert.equal(await page.locator('.collection-grid > button').count(), 8)
      await screenshot('desktop-all-works')
      await page.keyboard.press('Escape')
      assert(!(await page.getByRole('dialog').isVisible()))
      assert.match(
        await page.evaluate(() => document.activeElement.textContent),
        /All works/
      )
    }
  )
  for (const [id, label] of works) {
    await check(
      `${label}: catalogue, inspector, controls, and original route`,
      async () => {
        await button(label).click()
        assert.equal(new URL(page.url()).searchParams.get('work'), id)
        await button('Open experiment').click()
        await expectVisible(page.locator('.artwork-panel'))
        assert.equal(new URL(page.url()).searchParams.get('view'), 'inspect')
        assert.match(
          await page
            .getByRole('link', { name: 'Open original experiment' })
            .getAttribute('href'),
          new RegExp(`/${id}$`)
        )
        assert.equal(await page.locator('.panel-unavailable').count(), 0)
        await page.waitForTimeout(1200)
        await screenshot(`desktop-${id}-before`)
        if (id === 'lockedin') {
          await button('Open the cage').click()
          await expectVisible(button('Close the cage'))
          assert.match(
            await page.locator('.interaction-feedback').innerText(),
            /door is open/
          )
          await button('Say hello').click()
        } else if (id === 'hoverboard') {
          await page.getByRole('slider').press('End')
          assert.equal(await page.getByRole('slider').inputValue(), '30')
          await button('Do a kickflip').click()
          assert.match(
            await page.locator('.interaction-feedback').innerText(),
            /1 kickflip/
          )
        } else if (id === 'chromatic-gate') {
          await page.getByRole('slider').press('End')
          assert.equal(await page.getByRole('slider').inputValue(), '1.5')
          await button('Turn the sculpture').click()
          await expectVisible(button('Pause rotation'))
        } else if (id === 'car-physics') {
          await button('Launch the cars').click()
          await page.waitForFunction(
            () =>
              /[1-9]\d* collisions/.test(
                document.querySelector('.interaction-feedback')?.textContent
              ),
            { timeout: 20000 }
          )
        } else if (id === 'duck') {
          await button('Make a ripple').click()
          assert.match(
            await page.locator('.interaction-feedback').innerText(),
            /1 little ripple/
          )
          await button('Wake the flock').click()
        } else if (id === 'polaroid') {
          await button('Photograph 3').click()
          assert.equal(
            await button('Photograph 3').getAttribute('aria-pressed'),
            'true'
          )
        } else if (id === 'conveyor') {
          await button('Pause the belt').click()
          await expectVisible(button('Resume the belt'))
          await page.getByRole('slider').press('End')
          assert.equal(await page.getByRole('slider').inputValue(), '3')
          const before = Number(
            (await page.locator('.interaction-feedback').innerText()).match(
              /\d+/
            )[0]
          )
          await button('Scan next item').click()
          await page.waitForFunction(
            (count) =>
              Number(
                document
                  .querySelector('.interaction-feedback')
                  .textContent.match(/\d+/)[0]
              ) > count,
            before
          )
        } else if (id === 'techmap') {
          await page
            .getByRole('textbox', { name: 'Find a company' })
            .fill('Google')
          await expectVisible(page.locator('.company-results button').first())
          const name = await page
            .locator('.company-results button')
            .first()
            .innerText()
          await page.locator('.company-results button').first().click()
          await expectVisible(page.locator('.company-detail'))
          assert(
            (await page.locator('.company-detail').innerText()).includes(
              name.trim()
            )
          )
          await button('Pause the constellation').click()
          await expectVisible(button('Turn the constellation'))
        }
        await page.waitForTimeout(
          id === 'hoverboard' || id === 'duck' ? 200 : 1300
        )
        await screenshot(`desktop-${id}-after`)
        await button('Back to gallery').click()
        assert.equal(new URL(page.url()).search, '')
      }
    )
  }
  await check(
    'Orbit drag and zoom respond without losing gallery navigation',
    async () => {
      await page.mouse.move(1000, 450)
      await page.mouse.down()
      await page.mouse.move(1100, 470, { steps: 12 })
      await page.mouse.up()
      await page.mouse.wheel(0, -240)
      await page.waitForTimeout(700)
      await screenshot('desktop-orbit')
      await button('Gallery').click()
    }
  )
  await check('Standard quality, restore High, and refresh', async () => {
    await page
      .getByRole('combobox', { name: 'Rendering detail' })
      .selectOption('standard')
    await ready()
    await screenshot('desktop-standard')
    await page
      .getByRole('combobox', { name: 'Rendering detail' })
      .selectOption('high')
    await ready()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await ready()
    assert.equal(new URL(page.url()).pathname, '/third-time-charm/')
  })
  await check(
    'Mobile collection, controls, touch navigation, and overflow',
    async () => {
      await page.setViewportSize({ width: 393, height: 852 })
      await page.reload({ waitUntil: 'domcontentloaded' })
      await ready()
      assert.equal(
        await page
          .getByRole('combobox', { name: 'Rendering detail' })
          .inputValue(),
        'standard'
      )
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      )
      await screenshot('mobile-overview', true)
      await button('08 Tech Constellation').click()
      await button('Open experiment').click()
      await expectVisible(page.getByRole('textbox', { name: 'Find a company' }))
      await page.getByRole('textbox', { name: 'Find a company' }).fill('Apple')
      await expectVisible(page.locator('.company-results button').first())
      await screenshot('mobile-inspector', true)
      await button('Close artwork controls').click()
      await button('All works').click()
      await expectVisible(page.getByRole('dialog'))
      await screenshot('mobile-all-works', true)
      await button('Close all works').click()
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      )
    }
  )
  await check('No application or shader errors', async () => {
    const errors = report.issues.filter(
      (issue) =>
        issue.type === 'pageerror' ||
        issue.type === 'error' ||
        issue.type === 'request'
    )
    assert.deepEqual(errors, [])
  })
} catch (error) {
  report.checks.push({
    name: 'Complete browser run',
    passed: false,
    error: error.message,
  })
  await screenshot('blocked-state').catch(() => {})
} finally {
  report.pendingRequests = [...pending]
  report.pageText = await page
    .locator('body')
    .innerText()
    .catch(() => '')
  report.passed =
    report.checks.length > 0 && report.checks.every((check) => check.passed)
  await fs.writeFile(
    path.join(output, 'report.json'),
    JSON.stringify(report, null, 2)
  )
  await browser.close()
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        checks: report.checks,
        graphics: report.graphics,
        pendingRequests: report.pendingRequests,
        pageText: report.pageText,
        issues: report.issues,
      },
      null,
      2
    )
  )
}
if (!report.passed) process.exitCode = 1
