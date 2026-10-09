/**
 * Project gallery data.
 *
 * IMPORTANT: every image currently shipped is an ORIGINAL ILLUSTRATION created as a
 * placeholder — none of them is a photograph of a completed Asif Builders project.
 * To publish a real project:
 *   1. Drop the photo into src/assets/art/ (jpg/png/webp) with the SAME base name
 *      as the existing file (e.g. house-10marla-modern.jpg) — it replaces the illustration
 *      automatically — or change `image` below to a new file name.
 *   2. Set `illustrative: false` and (optionally) `status` and `location`.
 */
export type Category =
  | '5 Marla'
  | '10 Marla'
  | '1 Kanal'
  | 'Contemporary'
  | 'Traditional & Luxury'
  | 'Interiors'
  | 'Double-storey & Rooftop'
  | 'Construction Stages'
  | 'Plans & Elevations'
  | 'Finished Home Concepts';

export interface Project {
  id: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
  categories: Category[];
  /** Plot size label shown on the card, if relevant. */
  size?: string;
  /** Architectural style label. */
  style?: string;
  /** Only set for real projects. */
  status?: 'Completed' | 'Ongoing';
  location?: string;
  /** true while the image is an illustration rather than a real photograph. */
  illustrative: boolean;
}

export const categories: Category[] = [
  '5 Marla',
  '10 Marla',
  '1 Kanal',
  'Contemporary',
  'Traditional & Luxury',
  'Double-storey & Rooftop',
  'Interiors',
  'Construction Stages',
  'Finished Home Concepts',
  'Plans & Elevations',
];

const ill = true;

export const projects: Project[] = [
  {
    id: '5-marla-modern',
    title: 'Modern 5 Marla Double-Storey',
    caption: 'A compact frontage with a clean flat-roof profile, covered car porch and boundary-wall gate.',
    image: 'house-5marla-modern',
    alt: 'Front elevation of a modern double-storey 5 Marla house with a flat roof and car porch',
    categories: ['5 Marla', 'Double-storey & Rooftop', 'Contemporary'],
    size: '5 Marla', style: 'Modern', illustrative: ill,
  },
  {
    id: '5-marla-contemporary',
    title: 'Contemporary 5 Marla Facade',
    caption: 'Wood-slat cladding and a stone feature wall bring warmth to a narrow plot.',
    image: 'house-5marla-contemporary',
    alt: 'Contemporary 5 Marla house facade with wood slat cladding, stone feature wall and glass balcony',
    categories: ['5 Marla', 'Contemporary'],
    size: '5 Marla', style: 'Contemporary', illustrative: ill,
  },
  {
    id: '10-marla-modern',
    title: 'Modern 10 Marla with Cantilever',
    caption: 'A cantilevered upper floor over the porch with generous glazing for natural light.',
    image: 'house-10marla-modern',
    alt: 'Modern 10 Marla house with a cantilevered upper floor and large glass windows',
    categories: ['10 Marla', 'Contemporary', 'Double-storey & Rooftop'],
    size: '10 Marla', style: 'Modern', illustrative: ill,
  },
  {
    id: '10-marla-stone',
    title: '10 Marla Stone-Clad Contemporary',
    caption: 'Natural-stone cladding and a double-height entrance above a landscaped front lawn.',
    image: 'house-10marla-stone',
    alt: 'Contemporary 10 Marla house clad in natural stone with a double-height entrance and front lawn',
    categories: ['10 Marla', 'Contemporary'],
    size: '10 Marla', style: 'Contemporary', illustrative: ill,
  },
  {
    id: '1-kanal-modern',
    title: 'Modern 1 Kanal Villa',
    caption: 'Multiple volumes, a wide porch and long glazing lines on a generous 1 Kanal plot.',
    image: 'house-1kanal-modern',
    alt: 'Wide modern 1 Kanal villa with multiple volumes, a large porch and long glass windows',
    categories: ['1 Kanal', 'Contemporary'],
    size: '1 Kanal', style: 'Modern', illustrative: ill,
  },
  {
    id: '1-kanal-classical',
    title: '1 Kanal Classical Luxury Villa',
    caption: 'A symmetrical neo-classical facade with columns, pediment and arched windows.',
    image: 'house-1kanal-classical',
    alt: 'Symmetrical neo-classical 1 Kanal villa with columns, a pediment and arched windows',
    categories: ['1 Kanal', 'Traditional & Luxury'],
    size: '1 Kanal', style: 'Classical luxury', illustrative: ill,
  },
  {
    id: 'traditional-arches',
    title: 'Traditional Arches & Jharoka',
    caption: 'Pointed arches, a projecting jharoka, jali screens and a rooftop chhatri in brick tones.',
    image: 'house-traditional-arches',
    alt: 'Traditional Pakistani style house with arches, a jharoka balcony, jali screens and a rooftop chhatri',
    categories: ['Traditional & Luxury'],
    style: 'Traditional', illustrative: ill,
  },
  {
    id: 'fusion-luxury',
    title: 'Traditional-Meets-Modern Luxury',
    caption: 'Arches and brass accents combined with clean glazing for a luxury fusion look.',
    image: 'house-fusion-luxury',
    alt: 'Luxury house blending traditional arches with modern glass and brass accents',
    categories: ['Traditional & Luxury', 'Contemporary'],
    style: 'Fusion luxury', illustrative: ill,
  },
  {
    id: 'night-facade',
    title: 'Modern Facade at Dusk',
    caption: 'Warm interior light, LED facade strips and landscape lighting set the evening mood.',
    image: 'house-night-facade',
    alt: 'Modern house facade at dusk with warm interior lighting and LED strips',
    categories: ['Contemporary'],
    style: 'Modern', illustrative: ill,
  },
  {
    id: 'rooftop-terrace',
    title: 'Rooftop Terrace Design',
    caption: 'A usable rooftop with railing, pergola, seating, solar panels and a neat water-tank enclosure.',
    image: 'house-rooftop-terrace',
    alt: 'Double-storey house with a rooftop terrace, pergola, seating and solar panels',
    categories: ['Double-storey & Rooftop', 'Contemporary'],
    illustrative: ill,
  },
  {
    id: 'corner-plot',
    title: 'Modern Corner-Plot Home',
    caption: 'Two facades handled as one composition, ideal for corner plots.',
    image: 'house-corner-plot',
    alt: 'Modern corner-plot house showing two facades',
    categories: ['Contemporary', 'Double-storey & Rooftop'],
    style: 'Modern', illustrative: ill,
  },
  {
    id: 'living-room',
    title: 'Modern Living Lounge',
    caption: 'A TV lounge with a feature wall, layered lighting and a comfortable L-shaped sofa.',
    image: 'interior-living-room',
    alt: 'Modern living room with an L-shaped sofa, a feature TV wall and pendant lighting',
    categories: ['Interiors'],
    illustrative: ill,
  },
  {
    id: 'master-bedroom',
    title: 'Master Bedroom',
    caption: 'An upholstered headboard wall, sheer curtains and bedside lighting for a calm retreat.',
    image: 'interior-bedroom',
    alt: 'Master bedroom with an upholstered headboard, nightstands and sheer curtains',
    categories: ['Interiors'],
    illustrative: ill,
  },
  {
    id: 'modern-kitchen',
    title: 'Modern Kitchen with Island',
    caption: 'Handleless cabinets, an island with seating and a chimney hood over the hob.',
    image: 'interior-kitchen',
    alt: 'Modern kitchen with handleless cabinets, an island with stools and a chimney hood',
    categories: ['Interiors'],
    illustrative: ill,
  },
  {
    id: 'bathroom',
    title: 'Contemporary Bathroom',
    caption: 'Large-format tiles, floating vanity, backlit mirror and a glass shower enclosure.',
    image: 'interior-bathroom',
    alt: 'Contemporary bathroom with a floating vanity, round backlit mirror and glass shower',
    categories: ['Interiors'],
    illustrative: ill,
  },
  {
    id: 'dining',
    title: 'Dining Room',
    caption: 'A six-seat table under a statement chandelier with a crockery display unit.',
    image: 'interior-dining',
    alt: 'Dining room with a six-seat table, chandelier and a display cabinet',
    categories: ['Interiors'],
    illustrative: ill,
  },
  {
    id: 'progress-grey',
    title: 'Grey Structure Stage',
    caption: 'RCC frame, brickwork and scaffolding — the structural stage before finishing begins.',
    image: 'progress-grey-structure',
    alt: 'Construction site showing a reinforced concrete grey structure with scaffolding and brick piles',
    categories: ['Construction Stages'],
    illustrative: ill,
  },
  {
    id: 'progress-finishing',
    title: 'Finishing Stage',
    caption: 'Plastering, painting and window fitting as the home takes its final shape.',
    image: 'progress-finishing',
    alt: 'House in the finishing stage with plastered walls, scaffolding and paint buckets',
    categories: ['Construction Stages'],
    illustrative: ill,
  },
  {
    id: 'completed-home',
    title: 'Finished Home Concept',
    caption: 'A concept of the finished result: tidy lawn, completed facade and a home ready to move into.',
    image: 'progress-completed',
    alt: 'Concept render of a finished house in warm daylight with a tidy lawn',
    categories: ['Finished Home Concepts', 'Contemporary'],
    illustrative: ill,
  },
  {
    id: 'elevation',
    title: 'Front Elevation Drawing',
    caption: 'Blueprint-style elevation showing levels, openings and proportions before construction.',
    image: 'elevation-drawing',
    alt: 'Blueprint-style front elevation line drawing of a house with dimension lines',
    categories: ['Plans & Elevations'],
    illustrative: ill,
  },
  {
    id: 'floor-plan',
    title: 'Floor Plan Layout',
    caption: 'A room-by-room plan with doors, windows and furniture placement.',
    image: 'floor-plan',
    alt: 'Blueprint-style floor plan of a house with rooms, door swings and furniture symbols',
    categories: ['Plans & Elevations'],
    illustrative: ill,
  },
];

/** Projects shown in the home-page showcase (ids from the list above). */
export const featuredIds = ['10-marla-modern', '1-kanal-classical', 'traditional-arches', 'living-room', 'rooftop-terrace', 'progress-grey'];
