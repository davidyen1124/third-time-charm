# Daylight Museum — visual and interaction QA

**final result: passed**

The release candidate passed all four Chromium WebGL browser groups and nine Three.js scene tests. The selected concept and final overview were opened together at matching dimensions; the five fidelity surfaces and all eight inspection states were reviewed. No actionable P0/P1/P2 issue remains. The P3 label refinement below is non-blocking.

## Evidence

- Source visual truth: `docs/daylight-museum-reference.webp`, the selected Daylight Museum concept, 1487 × 1058 pixels.
- Release candidate: `5b731eed0a6dee5a955ea70521e37b6d1fc572c0`.
- Browser: Chromium 134, ANGLE / SwiftShader, WebGL 2. Desktop viewport and full-view capture: 1487 × 1058, device scale factor 1. Source and implementation require no density scaling.
- Desktop overview evidence: `docs/qa/museum-desktop.webp`. State: `/third-time-charm/`, gallery overview, Chromatic Gate caption, High detail.
- Mobile: 393 × 852 CSS pixels, scale factor 1, touch enabled, Standard detail. Full-page inspection capture: `docs/qa/museum-mobile.webp`, 393 × 1226 pixels. The complete collection can scroll to its final artwork; see `docs/qa/museum-mobile-collection.webp`, 393 × 971 pixels.
- Full browser screenshots and JSON reports: [release QA run](https://github.com/davidyen1124/third-time-charm/actions/runs/33988893463). Each of the four artifacts contains its tested commit, build entry module, graphics renderer, assertions, and console findings.
- Original PNG captures are retained in the workflow artifacts. Repository evidence uses WebP compression at the original pixel dimensions; no cropping, retouching, or density resizing is applied.

## Findings and comparison history

1. **WebGL unavailable in the original cloud browser — resolved for QA.** The original upstream demo also failed there. The application now offers a readable fallback, and a separate Chromium runner provides actual WebGL evidence. Passing scene tests alone were not treated as rendering proof.
2. **[P1] Black floor reflection artifacts — fixed.** The first real render (`33986571221`) showed black blocks across the floor. Removing the depth-dependent reflection pass and floor bump derivative eliminated them in the revised High-detail overview. Reflection and shadow resolutions were reduced to lower rendering cost.
3. **[P1] Obstructed car camera and [P2] hoverboard framing — fixed.** The cage hid the car track; a pillar intruded into the hoverboard view. Repositioned displays and closer inspection cameras now expose the complete objects. Revised browser evidence shows four visible cars, working collision feedback, and a clear hoverboard inspection view.
4. **[P2] Distant overview and catalogue proportions — fixed.** A closer, lower camera restores the sculpture-led composition. Larger thumbnail cells and row spacing bring the catalogue close to the reference proportions. The final canvas is 782 pixels high versus approximately 774 in the concept; the small difference accommodates the functional footer and rendering-detail selector.
5. **[P2] Mobile controls covered the artwork — fixed.** Inspection controls now flow below the canvas. Selection scrolls the artwork into view. The final mobile capture shows an unobstructed constellation and its complete controls. A rear plant that covered part of this exhibit has been removed.
6. **[P2] Text contrast over ceiling rails — fixed.** A light header scrim protects the dark serif title; a restrained lower scrim supports the white caption. The artwork remains visible beneath both, and neither intercepts pointer events.
7. **Interaction regressions — fixed.** Delayed-frame car physics now advances through bounded substeps; collision tests pass at four frames per second. Escape returns to the gallery even with a control focused. The mobile All works button has a stable accessible name. Explicit rotation controls work with reduced-motion preferences, while automatic constellation motion starts paused for those users.
8. **QA harness timing — corrected.** Canvas selection successfully changed the scene, but an immediate URL assertion ran before React committed the route. The test now waits for the selected route before checking it. This retains the direct canvas-pointer assertion.

## Required fidelity surfaces

| Surface                  | Assessment                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts and typography     | Local Caslon display type and Georgia body copy preserve the concept's serif hierarchy. The brand weight, catalogue sizes, line breaks, and control text were reviewed at full resolution. Desktop and mobile text remains readable without horizontal clipping.                                                                                                              |
| Spacing and layout       | The full-view comparison preserves the large museum scene above a complete two-row catalogue. Inspection cameras keep each exhibit visible. Mobile uses two catalogue columns and a separate control panel below the scene. The collection dialog scrolls to all eight works.                                                                                                 |
| Colors and tokens        | Warm ivory, limestone, dark ink, and muted red selection accents follow the concept. Lit materials, floor reflection, shadows, panel contrast, and selected states were inspected. Standard mode intentionally omits the planar floor reflection.                                                                                                                             |
| Image quality and assets | The scene contains actual Three.js geometry, local surface textures, a duck GLB, HDR lighting, and photographic prints. Original repository thumbnails preserve the identities of the existing experiments. Accepted adaptations include simpler real-time geometry, tabletop cars, the local beach photograph, and company name labels instead of the concept's brand marks. |
| Copy and content         | All eight named works appear in the catalogue and collection dialog. Each has specific instructions, functioning controls, feedback where relevant, and an original-experiment link. Company search uses the 149 entries actually present in the repository.                                                                                                                  |

The source is an illustrative concept rather than a supplied 3D scene. Its material depth and layout guide the implementation; the accepted asset and geometry adaptations above retain the requested interactive collection. The concept provides no inspection or mobile screen, so those states were assessed for readability, access, and consistency with the desktop design. Close inspection views provide the focused artwork and control review; additional UI crops are unnecessary because the supplied 1:1 captures make the text and controls legible.

## Verification scope

- `npm run format` and `npm run lint` pass; unrelated legacy formatting changes were removed.
- Production build passes. Vite reports large Three.js and legacy Rapier chunks; original experiments are lazy loaded.
- Nine scene tests pass. They exercise the real Three.js object graph and frame callbacks, with assets and text mocked, including the delayed-frame collision regression.
- Browser checks cover all eight artwork control flows, complete collection access, direct canvas selection, orbit and zoom, keyboard dismissal/focus, mobile touch navigation, search, thumbnail/font loading, quality changes, refresh, and base-path preservation.
- WebGL reports no graphics error. Completed browser parts report no application, shader, or asset-request errors. SwiftShader emits a `ReadPixels` performance warning; it is recorded rather than classified as an application error.
- The browser checks the served entry module against the production build, including during the post-deployment run.
- These checks establish Chromium desktop and mobile-viewport behavior. They do not establish physical-phone frame rate, Safari compatibility, or rendered behavior of every legacy experiment; original links are checked for their correct routes.

## Follow-up polish

- [P3] Several secondary company labels can overlap while the constellation rotates. The selected company's full name and description remain readable in the controls; labels could be limited to the selection in a later refinement.

## Release checklist

- [x] Final four-part browser suite passes on the release candidate (24 assertions across the four groups, including repeated renderer/asset/error checks).
- [x] Final source/overview comparison and mobile sight-line review are recorded. The final comparison shows the reflection, camera, typography, catalogue, and mobile fixes in place.
- [ ] Merge the reviewed implementation, wait for GitHub Pages, and run the same checks against the deployed build. Deployment evidence is recorded in the PR and the automatically triggered workflow; this report approves the pre-merge implementation.
