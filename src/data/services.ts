export interface Service {
  slug: string;
  title: string;
  /** One-line summary used on cards. */
  summary: string;
  /** Full description used on the Services page. */
  description: string;
  /** Typical scope items (general descriptions, not guarantees). */
  includes: string[];
  /** File basename in src/assets/art (extension optional / swappable). */
  image: string;
  imageAlt: string;
}

export const services: Service[] = [
  {
    slug: 'new-home-construction',
    title: 'New Home Construction',
    summary: 'From an empty plot to a finished family home, built to your plan and budget.',
    description:
      'We build new houses on your plot — 3 Marla to 2 Kanal and beyond — coordinating structure, services and finishes under one team so you are not left chasing multiple contractors. Every stage is explained to you in plain language, with clear scope before work begins.',
    includes: ['Plot and site assessment', 'Layout-based construction planning', 'Structure, brickwork and slabs', 'Services, finishes and handover'],
    image: 'svc-new-home',
    imageAlt: 'Illustration of a new modern home being planned on a residential plot',
  },
  {
    slug: 'residential-building-construction',
    title: 'Residential Building Construction',
    summary: 'Houses, portions and small multi-unit residential buildings built with careful supervision.',
    description:
      'Beyond single houses, we take on residential buildings with multiple floors or units — such as portions, flats and small apartment blocks — with attention to structural layout, circulation, services planning and consistent finishing across all units.',
    includes: ['Multi-storey and multi-unit layouts', 'Structural coordination', 'Shared services planning', 'Phased construction schedules'],
    image: 'svc-residential-building',
    imageAlt: 'Illustration of a small residential apartment building on a Pakistani street',
  },
  {
    slug: 'house-design-and-planning',
    title: 'House Design & Planning',
    summary: 'Practical, well-lit layouts that make the most of every marla.',
    description:
      'Good construction starts with a good plan. We help you develop floor layouts around how your family actually lives — room sizes, natural light, ventilation, privacy, parking and future expansion — and prepare the plans needed to build and to submit to the relevant local authority.',
    includes: ['Requirement and lifestyle discussion', 'Floor plan options', 'Space, light and ventilation planning', 'Drawings for construction'],
    image: 'svc-design-planning',
    imageAlt: 'Illustration of a drafting table with a house floor plan, set square and ruler',
  },
  {
    slug: 'architectural-design',
    title: 'Architectural Design',
    summary: 'Front elevations and facades that look modern today and age well.',
    description:
      'We develop elevations, facade treatments and material palettes — from clean modern lines to traditional arches and jharokas — so your home has its own identity. You review the look before construction begins, with materials chosen for the local climate and your budget.',
    includes: ['Front elevation concepts', 'Facade and material selection', 'Exterior detailing', 'Coordinated design set'],
    image: 'svc-architectural-design',
    imageAlt: 'Illustration of a 3D house model beside an elevation sketch and material swatches',
  },
  {
    slug: 'home-renovation-and-remodeling',
    title: 'Home Renovation & Remodeling',
    summary: 'Refresh an older home — new layout, new facade, new life.',
    description:
      'Renovating means working around an existing structure, so we start with a careful inspection. We then plan the changes — reconfiguring rooms, upgrading the facade, adding a floor or updating services — and manage the work to keep disruption as low as practical.',
    includes: ['Condition inspection', 'Layout changes and additions', 'Facade upgrade', 'Services and finishes refresh'],
    image: 'svc-renovation',
    imageAlt: 'Before-and-after illustration of a house facade being renovated',
  },
  {
    slug: 'home-maintenance-and-repairs',
    title: 'Home Maintenance & Repairs',
    summary: 'Fixing seepage, cracks, fittings and everyday wear before they grow.',
    description:
      'Small problems — a leaking pipe, damp patch, cracked plaster or faulty fitting — become expensive if ignored. We diagnose the cause, explain the fix and repair it properly, whether it is a one-off job or periodic upkeep for your home.',
    includes: ['Inspection and diagnosis', 'Seepage and crack repair', 'Fittings and fixtures', 'Periodic upkeep visits'],
    image: 'svc-maintenance',
    imageAlt: 'Illustration of repair tools and a toolbox in front of a house',
  },
  {
    slug: 'interior-and-exterior-finishing',
    title: 'Interior & Exterior Finishing',
    summary: 'Flooring, plaster, ceilings, cladding and the details that complete a home.',
    description:
      'Finishing is where a house starts to feel like a home. We handle plaster, tiling and marble work, false ceilings, wall panelling, woodwork coordination and exterior cladding — keeping lines straight and finishes consistent from room to room.',
    includes: ['Plaster and tile / marble work', 'Ceilings and wall treatments', 'Doors, windows and woodwork coordination', 'Exterior cladding and detailing'],
    image: 'svc-finishing',
    imageAlt: 'Illustration of finishing work with floor tiles, plaster trowel and wall panel samples',
  },
  {
    slug: 'plumbing-and-electrical-work',
    title: 'Plumbing & Electrical Work',
    summary: 'Safe wiring and reliable water systems, planned before the walls close.',
    description:
      'Concealed services are hard to fix later, so we plan them early. Our work covers water supply and drainage lines, tanks and pumps, wiring, distribution boards, switches, lighting points and provisions for ACs and appliances — installed neatly and tested before handover.',
    includes: ['Water supply and drainage', 'Wiring and distribution boards', 'Lighting, socket and AC provisions', 'Testing before handover'],
    image: 'svc-plumbing-electrical',
    imageAlt: 'Illustration of a wall cutaway showing pipes, wiring conduit and a distribution board',
  },
  {
    slug: 'painting-and-waterproofing',
    title: 'Painting & Waterproofing',
    summary: 'Clean paint finishes and roof / bathroom waterproofing that keeps water out.',
    description:
      'A proper paint job depends on surface preparation, and a dry home depends on waterproofing done right. We prepare walls, apply interior and exterior paint systems and waterproof roofs, bathrooms, water tanks and other wet areas with suitable treatments.',
    includes: ['Surface preparation and putty', 'Interior and exterior paint', 'Roof and terrace waterproofing', 'Bathroom and tank waterproofing'],
    image: 'svc-painting-waterproofing',
    imageAlt: 'Illustration of a paint roller, colour swatches and a waterproofing membrane over a roof slab',
  },
  {
    slug: 'kitchen-and-bathroom-renovation',
    title: 'Kitchen & Bathroom Renovation',
    summary: 'Modern, practical kitchens and bathrooms with proper drainage and storage.',
    description:
      'Kitchens and bathrooms are the most-used rooms in a home. We redesign them for storage, ventilation and easy cleaning — coordinating cabinetry, countertops, tiles, fixtures, plumbing and lighting so everything fits and works together.',
    includes: ['Layout and storage planning', 'Cabinets, counters and tiling', 'Sanitary fittings and fixtures', 'Plumbing, drainage and lighting'],
    image: 'svc-kitchen-bathroom',
    imageAlt: 'Illustration of a kitchen cabinet corner beside a bathroom vanity and tiles',
  },
  {
    slug: 'grey-structure-construction',
    title: 'Grey Structure Construction',
    summary: 'The complete structural shell — foundation to roof slab — ready for finishing.',
    description:
      'If you want to handle finishing separately, we build the grey structure: excavation, foundation, columns, beams, brickwork, slabs, stairs and basic plastering stage as agreed in the scope. The scope and handover point are written down before work starts.',
    includes: ['Excavation and foundation', 'Columns, beams and slabs', 'Brickwork and staircases', 'Clearly agreed handover point'],
    image: 'svc-grey-structure',
    imageAlt: 'Illustration of a reinforced concrete frame with brickwork in progress',
  },
  {
    slug: 'complete-turnkey-construction',
    title: 'Complete Turnkey Construction',
    summary: 'One team, one agreement — design, build, finish and hand over the keys.',
    description:
      'With turnkey construction we manage everything: design, structure, services, finishes and final inspection. You deal with one point of contact, follow progress at every stage and receive a finished home that is ready to move into.',
    includes: ['Design through to handover', 'Single point of contact', 'Stage-wise progress updates', 'Final inspection and key handover'],
    image: 'svc-turnkey',
    imageAlt: 'Illustration of a finished house with a large brass key and a handover checklist',
  },
];

export const serviceOptions = [...services.map((s) => ({ slug: s.slug, title: s.title })), { slug: 'other', title: 'Other / not sure yet' }];
