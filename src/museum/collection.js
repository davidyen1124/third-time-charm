export const asset = (path) => `${import.meta.env.BASE_URL}museum/${path}`
const prisoner = asset('thumbnails/locked-in.webp')
const hoverboard = asset('thumbnails/hoverboard.webp')
const gate = asset('thumbnails/chromatic-gate.webp')
const cars = asset('thumbnails/car-physics.webp')
const ducks = asset('thumbnails/duck.webp')
const polaroids = asset('thumbnails/polaroid.webp')
const conveyor = asset('thumbnails/conveyor.webp')
const constellation = asset('thumbnails/techmap.webp')

export const collection = [
  {
    id: 'lockedin',
    number: '01',
    title: 'Pink Prisoner',
    thumbnail: prisoner,
    discipline: 'Character study',
    description: 'A little character. A very committed cage.',
    instructions:
      'Open the cage, then give our resident a little encouragement.',
    position: [-6, 0, 0.8],
    target: [-6, 2.6, 0.8],
    camera: [-2.5, 3.9, 7.8],
  },
  {
    id: 'hoverboard',
    number: '02',
    title: 'Hoverboard',
    thumbnail: hoverboard,
    discipline: 'Motion & balance',
    description: 'A small rebellion against gravity.',
    instructions:
      'Tilt the board or send it into a kickflip. The rider is optimistic.',
    position: [-6.3, 0, -3.7],
    target: [-6.3, 2.3, -3.7],
    camera: [-4.9, 3.3, -0.8],
  },
  {
    id: 'chromatic-gate',
    number: '03',
    title: 'Chromatic Gate',
    thumbnail: gate,
    discipline: 'Color & form',
    description: 'Step through color and see the world differently.',
    instructions:
      'Pull the spectrum apart. Turn the sculpture. Find a new perspective.',
    position: [-0.7, 0, 0],
    target: [-0.7, 1.9, 0],
    camera: [4.4, 4.1, 7.4],
  },
  {
    id: 'car-physics',
    number: '04',
    title: 'Car Physics',
    thumbnail: cars,
    discipline: 'Collision study',
    description: 'Four cars. Several questionable decisions.',
    instructions:
      'Launch the cars and watch them collide. Tap a car to give it a nudge.',
    position: [-3.3, 0, -3.7],
    target: [-3.3, 1.2, -3.7],
    camera: [-3.3, 5.1, -0.8],
  },
  {
    id: 'duck',
    number: '05',
    title: 'Rubber Ducks',
    thumbnail: ducks,
    discipline: 'Water & play',
    description: 'A very small ocean. A very good afternoon.',
    instructions:
      'Touch the water to send a ripple through the flock. Tap a duck to make it hop.',
    position: [5.7, 0, 2.2],
    target: [5.7, 1.2, 2.2],
    camera: [10.5, 6.1, 10.1],
  },
  {
    id: 'polaroid',
    number: '06',
    title: 'Spotlight Polaroids',
    thumbnail: polaroids,
    discipline: 'Light & memory',
    description: 'Little moments, brought into the light.',
    instructions:
      'Move across the photographs to guide the light. Select a print to bring it closer.',
    position: [3.8, 0, -5.65],
    target: [3.8, 3.0, -5.65],
    camera: [4.1, 3.3, 1.4],
  },
  {
    id: 'conveyor',
    number: '07',
    title: 'Grocery Conveyor',
    thumbnail: conveyor,
    discipline: 'Everyday choreography',
    description: 'The surprisingly satisfying art of checking out.',
    instructions:
      'Change the belt speed. Tap an item to scan it, or let the scanner do its thing.',
    position: [6.5, 0, -3.9],
    target: [6.5, 1.55, -3.9],
    camera: [8, 4.0, 1.2],
  },
  {
    id: 'techmap',
    number: '08',
    title: 'Tech Constellation',
    thumbnail: constellation,
    discipline: 'Data in space',
    description: 'A universe of companies, connected by curiosity.',
    instructions:
      'Select a company to learn its story. Search the collection or turn the constellation.',
    position: [9.5, 0, -5.65],
    target: [9.5, 3.1, -5.65],
    camera: [9.5, 3.4, 1.9],
  },
]

export const initialControls = {
  cageOpen: false,
  wave: 0,
  tilt: 0,
  flip: 0,
  spread: 0.35,
  rotateGate: false,
  launch: 0,
  resetCars: 0,
  ripple: 0,
  duckHop: 0,
  photo: -1,
  beltSpeed: 1,
  beltPaused: false,
  scan: 0,
  constellationSpin: true,
  company: null,
  companySearch: '',
}

export const companyColors = [
  '#5c77bb',
  '#d8b565',
  '#719b82',
  '#aa8cb5',
  '#d17d66',
  '#819fa9',
]
