import otobus from '../data/ulasim/otobus.json';
import vapur from '../data/ulasim/vapur.json';
import izban from '../data/ulasim/izban.json';
import metro from '../data/ulasim/metro.json';
import tramvay from '../data/ulasim/tramvay.json';
import meta from '../data/ulasim/meta.json';

export { otobus, vapur, izban, metro, tramvay, meta };

export const BASE = '/toplu-tasima-saatleri';

// Bus, metro and tram timetables use tariff ids 1–3; ferry uses weekdays 1 (Mon) – 7 (Sun).
export const TARIFFS = [
  { id: '1', label: 'Hafta içi', days: '1,2,3,4,5' },
  { id: '2', label: 'Cumartesi', days: '6' },
  { id: '3', label: 'Pazar', days: '7' },
] as const;

export const WEEKDAYS = [
  { id: '1', label: 'Pazartesi', short: 'Pzt' },
  { id: '2', label: 'Salı', short: 'Sal' },
  { id: '3', label: 'Çarşamba', short: 'Çar' },
  { id: '4', label: 'Perşembe', short: 'Per' },
  { id: '5', label: 'Cuma', short: 'Cum' },
  { id: '6', label: 'Cumartesi', short: 'Cmt' },
  { id: '7', label: 'Pazar', short: 'Paz' },
] as const;

export function updatedAt(key: keyof typeof meta) {
  const iso = meta[key];
  if (!iso) return null;
  return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export const longDay = (ymd: string) =>
  new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(`${ymd}T12:00:00+03:00`));

export const every = (min: number) => `${String(min).replace('.', ',')} dk'da bir`;
