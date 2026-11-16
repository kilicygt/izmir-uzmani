// Daily "İzmir'de Bugün" bulletins written by scripts/fetch-bulten.mjs.
export interface Bulletin {
  date: string;
  generatedAt: string;
  weather: { code: number; max: number; min: number; rain: number; wind: number } | null;
  izbb: { title: string; date: string; summary: string; url: string; id?: number }[];
  eshot: { title: string; lines: string[]; start: string; end: string; isNew: boolean }[];
  izdeniz: { title: string; date: string; url: string }[];
  events: { title: string; slug: string; category: string; start: string; venue: string | null; image: string | null; free: boolean }[];
}

const files = import.meta.glob<Bulletin>('../data/bulten/*.json', { eager: true, import: 'default' });
export const bulletins: Bulletin[] = Object.values(files).sort((a, b) => b.date.localeCompare(a.date));
export const latest = bulletins[0];
export const issueNo = (b: Bulletin) => bulletins.length - bulletins.indexOf(b);

const tz = { timeZone: 'Europe/Istanbul' } as const;
export const longDate = (ymd: string) => new Date(`${ymd}T12:00:00+03:00`).toLocaleDateString('tr-TR', { ...tz, day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
export const shortDate = (ymd: string) => new Date(`${ymd}T12:00:00+03:00`).toLocaleDateString('tr-TR', { ...tz, day: 'numeric', month: 'long' });
export const clock = (iso: string) => new Date(iso).toLocaleTimeString('tr-TR', { ...tz, hour: '2-digit', minute: '2-digit' });

// WMO weather codes → Turkish
export function weatherText(code: number) {
  if (code === 0) return 'Açık';
  if (code <= 2) return 'Parçalı bulutlu';
  if (code === 3) return 'Bulutlu';
  if (code <= 48) return 'Sisli';
  if (code <= 57) return 'Çisentili';
  if (code <= 67) return 'Yağmurlu';
  if (code <= 77) return 'Karlı';
  if (code <= 82) return 'Sağanak yağışlı';
  return 'Gök gürültülü sağanak';
}

// Official news that concerns getting around the city goes into the transport section.
// "sefer" must not match "Seferihisar".
export const isTransport = (s: string) => /İZBAN|izban|metro|tramvay|vapur|İZDENİZ|ESHOT|otobüs|ulaşım|aktarma|sefer(?!ihisar)|trafik|yol çalışması|kavşak/i.test(s);
