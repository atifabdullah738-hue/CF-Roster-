export interface Step {
  title: string;
  summary: string;
  points: string[];
}

export const steps: Step[] = [
  {
    title: 'Consultation',
    summary: 'We listen first — your plot, family needs, style and budget.',
    points: ['Free initial discussion', 'Understanding requirements and priorities', 'Rough budget and timeline expectations'],
  },
  {
    title: 'Site Visit & Assessment',
    summary: 'We inspect the plot or existing house to understand what is possible.',
    points: ['Plot size, shape and orientation', 'Access, soil and surroundings', 'For renovations: condition of the existing structure'],
  },
  {
    title: 'Design & Planning',
    summary: 'Floor plans and elevations are developed and refined with you.',
    points: ['Floor plan options', 'Front elevation and facade concepts', 'Drawings prepared for construction and local approvals'],
  },
  {
    title: 'Costing & Agreement',
    summary: 'A written scope, specification and cost before any work starts.',
    points: ['Itemised estimate based on agreed materials', 'Payment schedule tied to stages', 'Written scope of work'],
  },
  {
    title: 'Grey Structure',
    summary: 'The structural shell is built under regular supervision.',
    points: ['Foundation, columns, beams and slabs', 'Brickwork and staircases', 'Stage inspections with progress updates'],
  },
  {
    title: 'Services & Finishing',
    summary: 'Plumbing, electrical, plaster, flooring, paint and fixtures.',
    points: ['Concealed services installed and tested', 'Tiling, ceilings, doors and windows', 'Painting, waterproofing and final detailing'],
  },
  {
    title: 'Inspection & Handover',
    summary: 'A final walk-through, snag fixes and key handover.',
    points: ['Joint walk-through of the finished home', 'Snag list resolved before handover', 'Handover of the finished house'],
  },
];
