import { getCollection, type CollectionEntry } from 'astro:content';
import data from '../data/events.json';

export interface Session { start: string; end: string; venue: string | null }

export type Admission = 'free' | 'free-ticket' | 'paid';

export interface EventItem {
  slug: string;
  title: string;
  category: string;
  organizer: string | null;
  ageLimit: number | null;
  /** 'free' = serbest giriş, 'free-ticket' = ücretsiz ama biletli, 'paid' = ücretli, null = bilinmiyor */
  admission: Admission | null;
  performer: string | null;
  image: string | null;
  summary: string[];
  body: string[];
  sessions: Session[];
  sourceUrl: string | null;
  sourceName: string | null;
  ticketUrl: string | null;
  entry?: CollectionEntry<'etkinlikler'>;
  /** Next upcoming session; for past events, the last session. */
  next: Session;
  ongoing: boolean;
  past: boolean;
}

const TZ = 'Europe/Istanbul';
const DAY = 86_400_000;

export function startOfTodayIstanbul(now = new Date()) {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);
  return new Date(`${ymd}T00:00:00+03:00`);
}

function status(sessions: Session[], now: Date): Pick<EventItem, 'next' | 'ongoing' | 'past'> {
  const today = startOfTodayIstanbul(now).getTime();
  const next = sessions.find((s) => new Date(s.end).getTime() >= now.getTime());
  if (!next) return { next: sessions[sessions.length - 1], ongoing: false, past: true };
  return { next, ongoing: new Date(next.start).getTime() < today, past: false };
}

const time0 = (d: string) => new Date(d).getTime();

export async function getAllEvents(now = new Date()): Promise<EventItem[]> {
  const auto = data.events.map((e) => ({ ...e, admission: ((e as { admission?: Admission | null }).admission ?? null), performer: null, ticketUrl: null }));
  const manual = (await getCollection('etkinlikler')).map((entry) => ({
    slug: entry.slug,
    title: entry.data.title,
    category: entry.data.category,
    organizer: entry.data.organizer ?? null,
    ageLimit: null,
    admission: entry.data.admission ?? null,
    performer: entry.data.performer ?? null,
    image: entry.data.image ?? null,
    summary: [],
    body: [],
    sessions: [{ start: entry.data.start, end: entry.data.end ?? entry.data.start, venue: entry.data.venue }],
    sourceUrl: entry.data.sourceUrl ?? null,
    sourceName: entry.data.sourceName ?? null,
    ticketUrl: entry.data.ticketUrl ?? null,
    entry,
  }));
  return [...auto, ...manual].map((e) => ({ ...e, ...status(e.sessions, now) }));
}

export async function getEvents(now = new Date()): Promise<EventItem[]> {
  return (await getAllEvents(now))
    .filter((e) => !e.past)
    .sort((a, b) => time0(a.next.start) - time0(b.next.start));
}

export async function getPastEvents(now = new Date()): Promise<EventItem[]> {
  return (await getAllEvents(now))
    .filter((e) => e.past)
    .sort((a, b) => time0(b.next.end) - time0(a.next.end));
}

export function groupEvents(events: EventItem[], now = new Date()) {
  const today = startOfTodayIstanbul(now).getTime();
  const weekEnd = today + 7 * DAY;
  const monthEnd = today + 31 * DAY;
  const startsAt = (e: EventItem) => new Date(e.next.start).getTime();
  const range = (from: number, to: number) => `${fmt(new Date(from), { day: 'numeric', month: 'long' })} – ${fmt(new Date(to - DAY), { day: 'numeric', month: 'long' })}`;

  return [
    { header: `${range(today, weekEnd)} · Bu Hafta`, filters: ['Bu Hafta', 'Bu Ay', 'Tümü'], events: events.filter((e) => !e.ongoing && startsAt(e) < weekEnd) },
    { header: 'Devam Eden Sergi ve Etkinlikler', filters: ['Bu Hafta', 'Bu Ay', 'Tümü'], events: events.filter((e) => e.ongoing) },
    { header: `${range(weekEnd, monthEnd)} · Bu Ay`, filters: ['Bu Ay', 'Tümü'], events: events.filter((e) => !e.ongoing && startsAt(e) >= weekEnd && startsAt(e) < monthEnd) },
    { header: 'Daha Sonra', filters: ['Tümü'], events: events.filter((e) => !e.ongoing && startsAt(e) >= monthEnd) },
  ].filter((g) => g.events.length > 0);
}

export function fmt(date: Date | string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, ...opts }).format(new Date(date));
}

export const dayMonth = (d: string) => fmt(d, { day: 'numeric', month: 'short' });
export const weekday = (d: string) => fmt(d, { weekday: 'short' });
export const time = (d: string) => fmt(d, { hour: '2-digit', minute: '2-digit' });
export const longDate = (d: string) => fmt(d, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

export function catColor(cat: string) {
  const map: Record<string, string> = {
    Konser: '#062f96', Tiyatro: '#ff7c11', Sergi: '#0b7a5c', Sinema: '#8a2be2',
    Festival: '#ff7c11', Çocuk: '#d6336c', 'Toplantı / Panel': '#6b4fa0', Diğer: '#6b7280',
  };
  return map[cat.trim()] ?? '#062f96';
}

const META_LINE = /^(📍\s*)?(yer|mekân|mekan|saat|tarih)\s*[:：]/i;
export function descriptionOf(e: EventItem, maxChars = 1200, maxParagraphs = 8) {
  const lead = e.summary.filter((l) => !META_LINE.test(l));
  const seen = new Set(lead);
  const rest = e.body.filter((l) => !META_LINE.test(l) && !seen.has(l) && !lead.some((s) => s.includes(l) || l.includes(s)));
  const out: string[] = [];
  let used = 0;
  for (const l of [...lead, ...rest]) {
    if ((used + l.length > maxChars || out.length >= maxParagraphs) && out.length > 0) return { paragraphs: out, truncated: true };
    out.push(l);
    used += l.length;
  }
  return { paragraphs: out, truncated: false };
}
