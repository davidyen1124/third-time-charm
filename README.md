# 🎨 Third Time Charm

> They say practice makes perfect, but this is my third React app and I'm still questioning my life choices.

## 🎪 Welcome to the Circus

The gallery used to yeet clicks to `github.io/lockedin` (and the rest of the demo roster) like the site lived at the domain root. Those are very confident 404s. It now remembers the `/third-time-charm` prefix, like a tourist who finally learned the hotel address.

### 🗂️ The Not-So-Grand Gallery [@third-time-charm/](https://davidyen1124.github.io/third-time-charm/)

The gallery has moved into a sunlit limestone museum. Apparently the rotating screenshot ring finally got an architecture budget. All eight exhibits are now real, interactive Three.js objects: open the cage, kickflip the hoverboard, spread the rainbow gates, launch colliding cars, disturb the ducks, spotlight photographs, scan groceries, and explore a company constellation. The catalogue keeps every work within reach, because even an expensive-looking museum should have signs. Original experiments remain accessible from each artwork, with a return link that mercifully remembers the museum exists.

The new gallery lives in `src/museum/`. Select a piece, then choose **Open experiment** for its controls. Drag to orbit, scroll or pinch to zoom, and use **Back to gallery** to return to the room. Keyboard users can reach every work and control; arrow keys browse works when a control is not focused, and Escape returns to the overview. **All works** opens the complete collection. On mobile, the catalogue becomes two columns. **Detail: Standard** reduces rendering cost by disabling the floor's planar reflection and lowering the pixel ratio. The room uses local material textures, local font files, and a locally cached duck model; asset credits are in `docs/museum-assets.md`.

The catalogue thumbnails are compressed local copies of the original screenshots in `.github/assets`. Even the souvenir shop would struggle to charge extra for that loading time.

Run `npm ci` and `npm run dev` to open the museum at `/third-time-charm/`. Run `npm test` for the scene interaction checks and `npm run build` for the production bundle. The gallery requires WebGL 2; when it is unavailable, the complete catalogue and original-demo links remain usable. See `design-qa.md` for the current validation status and remaining visual checks.

### 🔒 The Pink Prisoner [@third-time-charm/lockedin](https://davidyen1124.github.io/third-time-charm/lockedin)

Behold, a 3D masterpiece where a pink humanoid is forever trapped in a cylindrical cage! Built with Three.js because apparently, 2D wasn't complicated enough. Watch in amazement as our blocky friend eternally rotates like a sad display item at a department store. Features include: anatomically questionable proportions, a hairstyle that defies gravity, and enough geometry to make Euclid proud.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/locked-in.png" width="400" alt="Pink Prisoner Preview" />

### 🛹 The Physics-Defying Dude [@third-time-charm/hoverboard](https://davidyen1124.github.io/third-time-charm/hoverboard)

Meet our orange-bodied, pink-headed friend who's living his best life on a blue hoverboard. Thanks to some questionable physics calculations, he bounces around like a caffeinated kangaroo on a trampoline. Watch as random torque forces make him dance like he's at a rave, all while pretending that this is totally how hoverboards should work. Warning: May trigger flashbacks to your high school physics class.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/hoverboard.png" width="600" alt="Hoverboard Preview" />

### 🌈 The Chromatic Gate [@third-time-charm/chromatic-gate](https://davidyen1124.github.io/third-time-charm/chromatic-gate)

Step right up to The Chromatic Gate, where gravity and reason have taken a coffee break and design rules are gleefully tossed aside. This riotous jumble of misaligned arches and clashing hues is not a masterpiece but rather an audacious prank on architecture—allegedly born in a sizzling Santa Barbara summer when a group of deliriously eccentric painters, soaking in sun and absurdity, accidentally spilled a bucket of genius onto a blank canvas, resulting in a carnival of chaos that's as useful as a chocolate teapot and as baffling as a squirrel on a jetpack, a fun fact that only adds to its legendary allure.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/chromatic-gate.png" width="600" alt="Chromatic Gate Preview" />

Now powered by `SRGBColorSpace` because `sRGBEncoding` finally retired. Progress?

### 🚗 The Physics-Challenged Cars [@third-time-charm/car-physics](https://davidyen1124.github.io/third-time-charm/car-physics)

Welcome to our very own demolition derby, where four colorful cars have decided that Newton's laws are more like "suggestions." Watch as these rainbow-hued boxes of chaos launch themselves from the corners of our green stage, determined to recreate a particle collision experiment that would make CERN scientists scratch their heads. Each reset brings a fresh palette of colors because if you're going to break the laws of physics, you might as well do it in style. Click anywhere to restart the mayhem when the cars inevitably yeet themselves into the void. Warning: No actual cars were harmed in the making of this demo, but several physics textbooks filed formal complaints.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/car-physics.png" width="600" alt="Car Physics Preview" />

### 🦆 The Rubber Duck Flotilla [@third-time-charm/duck](https://davidyen1124.github.io/third-time-charm/duck)

Behold, the world's most overengineered rubber duck debugging session! Watch in amazement as an army of yellow debug companions bob peacefully on an infinite ocean, living their best digital lives. Each duck has mastered the art of perpetual motion, gently bouncing to an invisible rhythm that would make any physics engine proud. It's like a zen garden meets a bathtub, except we spent way too much time on the water shaders. Warning: May cause sudden urges to explain your code problems to inanimate objects.
And because no debugging session is complete without a little class, each duck now sports a dapper top hat and a distinguished mustache. Nothing says "professional" quite like formalwear on a floating toy.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/duck.png" width="600" alt="Duck Preview" />

### 📸 The Spotlight Polaroids [@third-time-charm/polaroid](https://davidyen1124.github.io/third-time-charm/polaroid)

"Hey, what if we made a photo gallery, but like, really extra?" - said someone who clearly had too much time and Three.js knowledge. Now your cursor moonlights as a dramatic spotlight operator in this ridiculously over-the-top presentation of... _checks notes_... five floating Polaroids. Yes, we turned the simple act of looking at photos into an avant-garde theater production where pictures play hide-and-seek with your mouse pointer. It's basically what happens when a developer watches too many crime noir films while coding. Pro tip: Try explaining to your boss why you spent three days making photos emerge from darkness instead of just using a normal image grid like a reasonable person. At least the shadows are pretty. Side note: This project was brought to you by our complete disregard for conventional UI/UX practices and an unhealthy obsession with making simple things unnecessarily complicated.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/polaroid.png" width="600" alt="Polaroid Preview" />

### 🛒 The Grocery Lane Conveyor [@third-time-charm/conveyor](https://davidyen1124.github.io/third-time-charm/conveyor)

Why settle for boring groceries when you can watch colorful cubes glide toward an imaginary cashier? This endlessly looping belt pauses just long enough to pretend a barcode is getting scanned before hustling on to the next box. It's more fun than actually shopping, and nobody judges you for buying 37 boxes of cereal.
The black belt finally figured out which way to face, so the boxes aren't moonwalking anymore. Progress!
Turns out length belongs on Z, so the cubes can strut forward like runway models instead of sideways figure skaters.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/conveyor.png" width="600" alt="Conveyor Preview" />

### 🌌 The Tech Company Constellation [@third-time-charm/techmap](https://davidyen1124.github.io/third-time-charm/techmap)

Welcome to Silicon Valley in space! This interactive 3D constellation maps over 1,700 tech companies as glowing spheres floating through the digital cosmos. Each company displays its actual logo (when it loads) and is positioned based on when it was founded - newer companies orbit closer to the center while the old-timers drift toward the edges. Hover over any sphere to see company details, and watch as they progressively load in batches like stars appearing at dusk. It's basically LinkedIn but with more physics and fewer spam connection requests. Built with real company data and a healthy disrespect for traditional data visualization methods.

<img src="https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/techmap.png" width="600" alt="Techmap Preview" />

## 🙌 Special Thanks To

- My therapist - For helping me cope with React's lifecycle methods
- The random Stack Overflow answer from 2014 that somehow still works
- The 147 npm packages doing absolutely nothing in my node_modules
- My rubber duck - The only one who truly understands my code
- ChatGPT - For writing commit messages that are funnier than my code
- My coffee machine - The real senior developer on this project
- Prettier went on a formatting spree across the demo pages, so now everything is perfectly aligned and mildly smug about it.
- The conveyor screenshot finally rolled onto the homepage, so the carousel doesn't look like it's missing a tooth anymore.
