/**
 * TESTIMONIALS — PLACEHOLDERS ONLY.
 * These are NOT real customer reviews. Replace each entry with genuine feedback
 * (with the customer's permission), then set `placeholder: false`.
 */
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
  placeholder: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Placeholder — add a genuine customer review here, in the customer’s own words, once permission has been obtained.',
    name: 'Customer Name',
    detail: 'Project type · City',
    placeholder: true,
  },
  {
    quote: 'Placeholder — a real review about communication, quality of work and handover experience will appear here.',
    name: 'Customer Name',
    detail: 'Project type · City',
    placeholder: true,
  },
  {
    quote: 'Placeholder — replace with a verified testimonial. Do not publish invented reviews.',
    name: 'Customer Name',
    detail: 'Project type · City',
    placeholder: true,
  },
];
