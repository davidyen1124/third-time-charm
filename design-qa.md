# Daylight Museum — implementation QA

**final result: blocked**

The eight interactive Three.js exhibits are implemented and their scene behavior tests pass. The available cloud browser disables WebGL, so the actual room, shaders, shadows, camera composition, visual fidelity, and device performance could not be verified. This is a draft implementation, not a visually approved release.

## Evidence and comparison state

- Source visual truth: `docs/daylight-museum-reference.webp`, the user's selected first concept, 1487 × 1058 pixels.
- Initial browser screenshot: `docs/qa/daylight-museum-webgl-blocked.jpg`.
- Revised browser screenshot: `docs/qa/daylight-museum-webgl-blocked-final.jpg`.
- Collection dialog: `docs/qa/daylight-museum-all-works.jpg`.
- Browser viewport: 1363 × 936 CSS pixels, device pixel ratio 1. Screenshots are 1363 × 936 pixels.
- Implementation route: `/third-time-charm/`; gallery overview, Chromatic Gate selected. The scene is in its WebGL-unavailable state. The source represents a successfully rendered scene, so they are different states.
- The source and initial implementation were opened in the same comparison input. The revised implementation was captured after the readable-fallback fix. No density scaling was required for the browser. Source and implementation have different viewport dimensions; no pixel-perfect or scene-fidelity conclusion is made.
- Focused scene comparisons were not possible because the renderer is unavailable. The visible HTML header, caption, catalogue, and collection dialog were inspected.

## Findings

### P0 — The browser cannot render the core 3D experience

The reference shows the complete sunlit room, real material reflections, shadows, and all eight exhibits. The available browser reports `GL_VENDOR=Disabled`, `GL_RENDERER=Disabled`, and failure to create a WebGL context. The original upstream demo failed in the same browser before implementation. The capability check now reports WebGL 2 unavailable and preserves the HTML collection.

**Required follow-up:** Run this branch in a browser with WebGL 2 enabled. Capture the overview and all eight inspection states; verify shader compilation, reflections, light exposure, camera occlusion, touch controls, and frame rate. Compare the rendered room to the selected reference at matching viewport dimensions, correct differences, and repeat visual QA before release.

### P2 — Low-contrast fallback caption (fixed)

The initial screenshot showed a white, shadowed caption on the empty pale error background. `.renderer-unavailable .museum-caption` now uses the dark ink token and no text shadow, and the inactive orbit hint is hidden. The revised screenshot confirms the fix. It does not establish scene rendering success.

### P2 — Root navigation lost its trailing slash (fixed)

Refreshing the gallery after navigation exposed Vite's base-path notice. The router now uses `import.meta.env.BASE_URL` including its trailing slash. Browser checks confirmed artwork selection and return-to-gallery both retain `/third-time-charm/`.

## Required fidelity surfaces

| Surface                  | Assessment                                                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography               | Local Libre Caslon Display loads successfully. The large dark serif brand, small subtitle, serif captions, and numbered catalogue follow the concept. Physical 3D labels and exact line breaks need a working renderer.                                                                               |
| Spacing and layout       | Desktop header and 2 × 4 catalogue are visible with no horizontal overflow at 1363 pixels. The complete collection fits in its modal. Scene composition and mobile layouts remain unverified.                                                                                                         |
| Colors and tokens        | The HTML shell follows the warm ivory, dark ink, and muted red selection palette. The error-state caption is readable after the fix. Sunlight, stone, metal, and water appearance remain unverified.                                                                                                  |
| Image quality and assets | All eight local thumbnails load. They are the original repository screenshots rather than fictional renders from the concept; this preserves each original experiment's identity. Generated material textures and the real duck GLB are local assets. Their rendered appearance needs GPU validation. |
| Copy and content         | The title, subtitle, selected-work caption, and complete eight-work collection follow the selected direction. Every artwork has specific instructions and controls, with an original-demo link. The unavailable state explains why the scene cannot open.                                             |

## Verification

- `npm run format`: run as required by `AGENTS.md`; unrelated legacy formatting changes were removed from the implementation diff.
- `npm run lint`: passed with zero errors and warnings.
- `npm run build`: passed. Vite warns about large Three.js and legacy Rapier chunks; legacy experiments are lazy loaded.
- `npm test`: 9 tests passed, covering collection registration plus cage opening and waving, hoverboard leaning and kickflips, gate spreading and rotation, car collision/bounds/reset behavior, water ripples and duck hops, photograph selection, conveyor scanning/pause, and company selection/search representation.
- Scene tests use the actual Three.js object graph and frame callbacks. Network assets, text rendering, and the duck model are mocked. They do not verify GPU shaders, rendered lighting, pointer raycasting in the browser, or frame rate.
- Browser: catalogue selections reached the respective artwork panels; all eight works were marked explored during the navigation run. The collection modal exposes all eight cards and supports dismissal. Thumbnail loading, display font loading, root path preservation, and the readable WebGL failure state were checked.
- Console checked: the blocking error is WebGL context creation in the cloud browser. No successful 3D render was observed. No console-clean claim is made for the unrendered scene.

## Comparison history

1. Source and initial browser capture inspected together. Core room absent because WebGL is disabled; fallback caption contrast was poor.
2. Added a capability check and explicit retry/failure UI instead of an indefinite loading state. Updated error-state caption colors and hid unusable orbit instructions. Revised browser capture confirms readable fallback.
3. Fixed the root route trailing slash discovered during reload and confirmed navigation retains the configured base path.
4. Core visual review remains blocked. Browser UI checks and passing scene behavior tests do not replace it.

## Remaining implementation checklist

1. Open in a WebGL 2 capable browser and complete the full-view reference comparison.
2. Exercise every pointer and keyboard action in all eight inspection states; check return navigation and the complete collection.
3. Verify narrow layouts and touch interactions on a phone, plus the Standard quality mode.
4. Tune any visible materials, light exposure, occlusion, scaling, and thumbnail crops from actual captures.
5. Mark this report passed only after the remaining scene and responsive visual checks pass.
