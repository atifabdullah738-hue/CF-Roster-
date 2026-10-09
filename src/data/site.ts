/**
 * Single source of truth for company details.
 * Edit this file to update the whole website. Nothing here is invented:
 * anything not supplied by the owner is left null / empty on purpose.
 */

export interface Person {
  name: string;
  title: string;
  /** Number exactly as the owner supplied it (display format). */
  phone: string;
  /**
   * Set to true ONLY when the complete number is confirmed.
   * Unconfirmed numbers are shown as plain text with no call / WhatsApp links.
   */
  phoneConfirmed: boolean;
  /** Short public-facing note shown next to an unconfirmed number. */
  phoneNote?: string;
}

export const site = {
  name: 'Asif Builders',
  tagline: 'Residential construction, design & renovation',
  description:
    'Asif Builders is a residential construction company offering house design, grey structure, turnkey construction, renovation and maintenance for Pakistani homes.',
  /** Country calling code used to build tel: and WhatsApp links from local numbers. */
  countryCode: '92',

  leadership: [
    {
      name: 'Muhammad Asif Waheed',
      title: 'CEO',
      // Confirmed by the owner: +92 300 4337882
      phone: '0300 4337882',
      phoneConfirmed: true,
    },
    {
      name: 'Abdullah Asif',
      title: 'Vice President (VP)',
      phone: '0322 9373709',
      phoneConfirmed: true,
    },
  ] satisfies Person[],

  /** Number used for the floating / inquiry WhatsApp buttons. Must be confirmed. */
  whatsappPerson: 'Abdullah Asif',

  /**
   * Business address. Leave null until the real address is supplied — the
   * Contact page and footer show a neutral placeholder instead of a made-up one.
   * Example: { lines: ['Plot 12, Main Boulevard', 'DHA Phase 5'], city: 'Lahore' }
   */
  address: null as null | { lines: string[]; city: string },

  /** Office hours – null hides the row. */
  hours: null as null | string,

  /** Optional email – null hides it everywhere. */
  email: null as null | string,

  /** Social profiles – null entries are hidden. */
  social: { facebook: null, instagram: null, youtube: null } as Record<string, string | null>,

  /** Contact-form endpoint (see .env.example). Empty → form validates but does not claim delivery. */
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) || '',
  /** Optional public access key for Web3Forms-style services (it is designed to be public). */
  formAccessKey: (import.meta.env.PUBLIC_FORM_ACCESS_KEY as string | undefined) || '',
  /** Optional Google Maps embed URL. */
  mapEmbedUrl: (import.meta.env.PUBLIC_MAP_EMBED_URL as string | undefined) || '',
};

export const ceo = site.leadership[0];
export const vp = site.leadership[1];

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Our Process', href: '/process' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
];
