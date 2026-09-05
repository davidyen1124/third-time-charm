/* eslint-disable react/prop-types */
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowCounterClockwise,
  ArrowUpRight,
  Check,
  CornersOut,
  Hand,
  MagnifyingGlass,
  Pause,
  Play,
  X,
} from '@phosphor-icons/react'
import { collection, initialControls } from './collection'
import './museum.css'

const MuseumScene = lazy(() => import('./MuseumScene'))

class CanvasBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    this.props.onError(error.message)
  }
  render() {
    if (this.state.error)
      return (
        <div className="museum-unavailable" role="status">
          <p>The 3D room couldn’t open.</p>
          <span>
            {/WebGL|context/i.test(this.state.error.message)
              ? 'WebGL is unavailable in this browser. Your complete collection is still here.'
              : 'A gallery asset could not load. Please try again.'}
          </span>
          <button onClick={this.props.onRetry}>
            Try again <ArrowCounterClockwise size={15} />
          </button>
        </div>
      )
    return this.props.children
  }
}

function Action({ children, active, primary, ...props }) {
  return (
    <button
      className={`art-action${active ? ' is-on' : ''}${primary ? ' art-action-primary' : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}

function Slider({ label, value, onChange, min, max, step, display }) {
  return (
    <label className="art-slider">
      <span>
        {label}
        <output>{display ?? value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function ArtworkControls({
  work,
  controls: c,
  onControl: change,
  statuses,
  companies,
}) {
  const company = companies.find((item) => item.id === c.company)
  const matches = c.companySearch.trim()
    ? companies
        .filter((item) =>
          item.name.toLowerCase().includes(c.companySearch.toLowerCase())
        )
        .slice(0, 6)
    : []
  switch (work.id) {
    case 'lockedin':
      return (
        <div className="art-controls">
          <Action
            primary
            active={c.cageOpen}
            aria-pressed={c.cageOpen}
            onClick={() => change('cageOpen', !c.cageOpen)}
          >
            {c.cageOpen ? 'Close the cage' : 'Open the cage'}
            <ArrowRight size={17} />
          </Action>
          <Action onClick={() => change('wave', c.wave + 1)}>
            Say hello
            <Hand size={17} />
          </Action>
          <p className="interaction-feedback" role="status">
            {c.cageOpen
              ? 'The door is open. Freedom looks good.'
              : 'Our resident is accepting visitors.'}
          </p>
        </div>
      )
    case 'hoverboard':
      return (
        <div className="art-controls">
          <Slider
            label="Lean"
            value={c.tilt}
            min={-30}
            max={30}
            step={1}
            display={`${c.tilt}°`}
            onChange={(v) => change('tilt', v)}
          />
          <Action primary onClick={() => change('flip', c.flip + 1)}>
            Do a kickflip
            <ArrowUpRight size={17} />
          </Action>
          <Action onClick={() => change('tilt', 0)}>
            Find your balance
            <ArrowCounterClockwise size={16} />
          </Action>
          <p className="interaction-feedback" role="status">
            {c.flip > 0
              ? `${c.flip} ${c.flip === 1 ? 'kickflip' : 'kickflips'} and counting.`
              : 'A little tilt goes a long way.'}
          </p>
        </div>
      )
    case 'chromatic-gate':
      return (
        <div className="art-controls">
          <Slider
            label="Spread the spectrum"
            value={c.spread}
            min={0}
            max={1.5}
            step={0.01}
            display={`${Math.round((c.spread / 1.5) * 100)}%`}
            onChange={(v) => change('spread', v)}
          />
          <Action
            primary
            aria-pressed={c.rotateGate}
            onClick={() => change('rotateGate', !c.rotateGate)}
          >
            {c.rotateGate ? 'Pause rotation' : 'Turn the sculpture'}
            {c.rotateGate ? <Pause size={16} /> : <Play size={16} />}
          </Action>
          <Action
            onClick={() => {
              change('spread', 0.35)
              change('rotateGate', false)
            }}
          >
            Original arrangement
            <ArrowCounterClockwise size={16} />
          </Action>
        </div>
      )
    case 'car-physics':
      return (
        <div className="art-controls">
          <Action primary onClick={() => change('launch', c.launch + 1)}>
            Launch the cars
            <Play size={16} />
          </Action>
          <Action onClick={() => change('resetCars', c.resetCars + 1)}>
            Reset the track
            <ArrowCounterClockwise size={16} />
          </Action>
          <p className="interaction-feedback" role="status">
            {statuses.cars || 'Ready when you are.'}
          </p>
        </div>
      )
    case 'duck':
      return (
        <div className="art-controls">
          <Action primary onClick={() => change('ripple', c.ripple + 1)}>
            Make a ripple
            <CornersOut size={17} />
          </Action>
          <Action onClick={() => change('duckHop', c.duckHop + 1)}>
            Wake the flock
            <ArrowUpRight size={17} />
          </Action>
          <p className="interaction-feedback" role="status">
            {c.ripple > 0
              ? `${c.ripple} little ${c.ripple === 1 ? 'ripple' : 'ripples'} in the world.`
              : 'You can also touch the water or a duck.'}
          </p>
        </div>
      )
    case 'polaroid':
      return (
        <div className="art-controls">
          <div
            className="photo-selector"
            role="group"
            aria-label="Select a photograph"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                aria-label={`Photograph ${i + 1}`}
                aria-pressed={c.photo === i}
                onClick={() => change('photo', c.photo === i ? -1 : i)}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
          <Action onClick={() => change('photo', -1)}>
            Return the photographs
            <ArrowCounterClockwise size={16} />
          </Action>
          <p className="interaction-feedback">
            Move over a print to guide the spotlight.
          </p>
        </div>
      )
    case 'conveyor':
      return (
        <div className="art-controls">
          <Slider
            label="Belt speed"
            value={c.beltSpeed}
            min={0.25}
            max={3}
            step={0.25}
            display={`${c.beltSpeed}×`}
            onChange={(v) => change('beltSpeed', v)}
          />
          <Action
            primary
            aria-pressed={c.beltPaused}
            onClick={() => change('beltPaused', !c.beltPaused)}
          >
            {c.beltPaused ? 'Resume the belt' : 'Pause the belt'}
            {c.beltPaused ? <Play size={16} /> : <Pause size={16} />}
          </Action>
          <Action onClick={() => change('scan', c.scan + 1)}>
            Scan next item
            <Check size={17} />
          </Action>
          <p className="interaction-feedback" role="status">
            {statuses.conveyor || '0 items scanned'}
          </p>
        </div>
      )
    case 'techmap':
      return (
        <div className="art-controls">
          <label className="company-search">
            <MagnifyingGlass size={16} />
            <input
              aria-label="Find a company"
              placeholder="Find a company…"
              value={c.companySearch}
              onChange={(e) => change('companySearch', e.target.value)}
            />
          </label>
          {c.companySearch && (
            <div className="company-results">
              {matches.length ? (
                matches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      change('company', item.id)
                      change('companySearch', '')
                    }}
                  >
                    {item.name}
                    <ArrowUpRight size={13} />
                  </button>
                ))
              ) : (
                <p>No companies found.</p>
              )}
            </div>
          )}
          {company && (
            <div className="company-detail" role="status">
              <strong>{company.name}</strong>
              <p>{company.description}</p>
              <span>
                Founded {company.founded} · From the repository collection
              </span>
            </div>
          )}
          <Action
            primary
            aria-pressed={c.constellationSpin}
            onClick={() => change('constellationSpin', !c.constellationSpin)}
          >
            {c.constellationSpin
              ? 'Pause the constellation'
              : 'Turn the constellation'}
            {c.constellationSpin ? <Pause size={16} /> : <Play size={16} />}
          </Action>
          {!company && (
            <p className="interaction-feedback">
              Select a sphere, or search {companies.length} companies.
            </p>
          )}
        </div>
      )
    default:
      return null
  }
}

function Catalogue({ selected, onSelect, visited }) {
  return (
    <nav className="museum-catalogue" aria-label="Artwork collection">
      {collection.map((work) => (
        <button
          key={work.id}
          className={`catalogue-work${selected === work.id ? ' selected' : ''}`}
          onClick={() => onSelect(work.id)}
          aria-pressed={selected === work.id}
          aria-label={`${work.number} ${work.title}`}
        >
          <span className={`catalogue-thumb thumb-${work.id}`}>
            <img src={work.thumbnail} alt="" />
          </span>
          <span className="catalogue-copy">
            <span className="catalogue-number">
              {work.number}
              {visited.has(work.id) && (
                <Check size={11} aria-label="Explored" />
              )}
            </span>
            <span className="catalogue-title">{work.title}</span>
          </span>
          <ArrowUpRight className="catalogue-arrow" size={17} />
        </button>
      ))}
    </nav>
  )
}

function AllWorksDialog({ open, onClose, onSelect }) {
  const dialog = useRef()
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal()
    if (!open && dialog.current.open) dialog.current.close()
  }, [open])
  return (
    <dialog
      ref={dialog}
      className="collection-dialog"
      onClose={onClose}
      aria-labelledby="collection-heading"
      onClick={(e) => {
        if (e.target === dialog.current) onClose()
      }}
    >
      <div className="collection-dialog-head">
        <div>
          <span className="eyebrow">THE COMPLETE COLLECTION</span>
          <h2 id="collection-heading">Eight ways to be curious.</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close all works"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>
      <div className="collection-grid">
        {collection.map((work) => (
          <button
            key={work.id}
            onClick={() => {
              onSelect(work.id)
              onClose()
            }}
          >
            <img src={work.thumbnail} alt={work.title} />
            <div>
              <span>
                {work.number} / {work.discipline}
              </span>
              <h3>
                {work.title}
                <ArrowUpRight size={20} />
              </h3>
              <p>{work.description}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="collection-dialog-foot">
        A collection of playful experiments by David Yen.
      </p>
    </dialog>
  )
}

export default function Museum() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('work')
  const work = collection.find((item) => item.id === selected) || collection[2]
  const mode =
    params.get('view') === 'inspect' && selected
      ? 'inspect'
      : selected
        ? 'preview'
        : 'gallery'
  const [controls, setControls] = useState(initialControls)
  const [statuses, setStatuses] = useState({})
  const [companies, setCompanies] = useState([])
  const [allWorks, setAllWorks] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [rendererKey, setRendererKey] = useState(0)
  const [webglAvailable, setWebglAvailable] = useState(null)
  const [quality, setQuality] = useState(() =>
    window.matchMedia('(max-width: 700px)').matches ? 'standard' : 'high'
  )
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [visited, setVisited] = useState(new Set())
  const focusHeading = useRef()
  useEffect(() => {
    let context
    try {
      context = document.createElement('canvas').getContext('webgl2')
    } catch {
      /* The collection remains available without WebGL. */
    }
    if (context) {
      context.getExtension('WEBGL_lose_context')?.loseContext()
      setWebglAvailable(true)
    } else {
      setWebglAvailable(false)
      setError('WebGL 2 is unavailable')
      setReady(true)
    }
  }, [rendererKey])
  useEffect(() => {
    const abort = new AbortController()
    fetch(`${import.meta.env.BASE_URL}companies.json`, { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Could not load the company collection')
        return r.json()
      })
      .then(setCompanies)
      .catch((e) => {
        if (e.name !== 'AbortError')
          setStatuses((s) => ({ ...s, companies: e.message }))
      })
    return () => abort.abort()
  }, [])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const changed = () => setReducedMotion(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  const select = useCallback((id) => setParams({ work: id }), [setParams])
  const overview = useCallback(() => setParams({}), [setParams])
  const onControl = useCallback(
    (name, value) => setControls((c) => ({ ...c, [name]: value })),
    []
  )
  const onStatus = useCallback(
    (name, value) =>
      setStatuses((s) => (s[name] === value ? s : { ...s, [name]: value })),
    []
  )
  const onReady = useCallback(() => {
    setReady(true)
    setError(null)
  }, [])
  const onError = useCallback((message) => {
    setError(message)
    setReady(true)
  }, [])
  const retry = useCallback(() => {
    setReady(false)
    setError(null)
    setRendererKey((k) => k + 1)
  }, [])
  const openWork = () => {
    setParams({ work: work.id, view: 'inspect' })
    setVisited((v) => new Set([...v, work.id]))
  }
  useEffect(() => {
    if (mode === 'inspect') focusHeading.current?.focus({ preventScroll: true })
  }, [mode])
  useEffect(() => {
    const keydown = (e) => {
      if (
        allWorks ||
        e.target.closest(
          'input, button, a, select, textarea, [contenteditable]'
        )
      )
        return
      if (e.key === 'Escape') overview()
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const index = collection.indexOf(work)
        select(collection[(index + (e.key === 'ArrowRight' ? 1 : 7)) % 8].id)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [allWorks, overview, select, work])
  return (
    <div
      className={`museum-shell${mode === 'inspect' ? ' is-inspecting' : ''}${error ? ' renderer-unavailable' : ''}`}
    >
      <a href="#artwork-collection" className="skip-collection">
        Skip to all artworks
      </a>
      <section className="museum-stage" aria-label="Interactive museum">
        <div
          className="museum-canvas"
          aria-label="Three-dimensional exhibition space"
        >
          {webglAvailable === true && (
            <CanvasBoundary key={rendererKey} onError={onError} onRetry={retry}>
              <Suspense fallback={null}>
                <MuseumScene
                  work={work}
                  mode={mode}
                  controls={controls}
                  companies={companies}
                  onSelect={select}
                  onControl={onControl}
                  onStatus={onStatus}
                  quality={quality}
                  reducedMotion={reducedMotion}
                  onReady={onReady}
                />
              </Suspense>
            </CanvasBoundary>
          )}
          {webglAvailable === false && (
            <div className="museum-unavailable" role="status">
              <p>This browser can’t enter the 3D room.</p>
              <span>
                WebGL 2 is unavailable. You can browse all eight works below, or
                try the gallery in a browser with 3D graphics enabled.
              </span>
              <button onClick={retry}>
                Try again
                <ArrowCounterClockwise size={15} />
              </button>
            </div>
          )}
        </div>
        {!ready && (
          <div className="museum-loading" role="status">
            <span className="loading-line" />
            <span>Letting the light in…</span>
            <small>Preparing the gallery</small>
          </div>
        )}
        <header className="museum-header">
          <div className="museum-brand">
            <button
              onClick={overview}
              aria-label="Third Time Charm gallery overview"
            >
              <h1>Third Time Charm</h1>
            </button>
            <p>A collection of playful experiments.</p>
          </div>
          <nav aria-label="Gallery navigation">
            <button
              className={!allWorks ? 'nav-active' : ''}
              onClick={overview}
            >
              Gallery
            </button>
            <button onClick={() => setAllWorks(true)}>
              All works<span className="nav-count">08</span>
            </button>
          </nav>
        </header>
        {mode !== 'inspect' ? (
          <div className="museum-caption" aria-live="polite">
            <p className="museum-caption-title">
              <span>{work.number} / 08</span>
              <span className="caption-dash">—</span>
              {work.title}
            </p>
            <p className="museum-caption-description">{work.description}</p>
            <button className="open-experiment" onClick={openWork}>
              Open experiment
              <ArrowRight size={24} weight="light" />
            </button>
            <span className="caption-hint">Select a work to explore.</span>
          </div>
        ) : (
          <aside
            className="artwork-panel"
            aria-label={`${work.title} controls`}
          >
            <div className="artwork-panel-top">
              <span className="eyebrow">
                {work.number} / 08 · {work.discipline}
              </span>
              <button
                className="icon-button"
                onClick={() => select(work.id)}
                aria-label="Close artwork controls"
              >
                <X size={20} />
              </button>
            </div>
            <h2 tabIndex={-1} ref={focusHeading}>
              {work.title}
            </h2>
            <p className="artwork-instructions">{work.instructions}</p>
            {error ? (
              <p className="panel-unavailable">
                The 3D renderer is unavailable in this browser. You can still
                visit the original experiment below.
              </p>
            ) : (
              <ArtworkControls
                work={work}
                controls={controls}
                onControl={onControl}
                statuses={statuses}
                companies={companies}
              />
            )}
            <Link className="original-demo" to={`/${work.id}`}>
              Open original experiment
              <ArrowUpRight size={14} />
            </Link>
          </aside>
        )}
        <div className="museum-scene-tools">
          {mode !== 'gallery' && (
            <button className="overview-button" onClick={overview}>
              <ArrowLeft size={16} />
              Back to gallery
            </button>
          )}
          <span className="scene-hint">
            Drag to look around · Scroll to zoom
          </span>
        </div>
      </section>
      <div id="artwork-collection" className="catalogue-region">
        <Catalogue selected={work.id} onSelect={select} visited={visited} />
        <footer className="museum-footer">
          <span>
            DAVID YEN <span className="footer-divider">/</span> A PLAYFUL
            COLLECTION
          </span>
          <label>
            Detail
            <select
              aria-label="Rendering detail"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="high">High</option>
              <option value="standard">Standard</option>
            </select>
          </label>
        </footer>
      </div>
      <AllWorksDialog
        open={allWorks}
        onClose={() => setAllWorks(false)}
        onSelect={select}
      />
    </div>
  )
}
