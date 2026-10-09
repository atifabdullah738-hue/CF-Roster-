import { site, type Person } from '../data/site';

const digits = (s: string) => s.replace(/\D/g, '');

/** A complete Pakistani mobile number is 11 digits starting 03 (e.g. 0322 9373709). */
export function isCompleteMobile(phone: string): boolean {
  return /^03\d{9}$/.test(digits(phone));
}

/** "0322 9373709" -> "+923229373709" */
export function e164(phone: string): string {
  const d = digits(phone).replace(/^0+/, '');
  return `+${site.countryCode}${d}`;
}

export function telHref(p: Person): string | null {
  return p.phoneConfirmed && isCompleteMobile(p.phone) ? `tel:${e164(p.phone)}` : null;
}

export function waHref(p: Person, text = ''): string | null {
  if (!p.phoneConfirmed || !isCompleteMobile(p.phone)) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${e164(p.phone).slice(1)}${q}`;
}

/** First leadership contact whose number is confirmed (used for floating WhatsApp). */
export function whatsappContact(): Person | undefined {
  return (
    site.leadership.find((p) => p.name === site.whatsappPerson && waHref(p)) ??
    site.leadership.find((p) => waHref(p))
  );
}
