// Recent earthquakes in and around İzmir from AFAD (Afet ve Acil Durum Yönetimi Başkanlığı).
// Used by the server-rendered /deprem page and the /api/depremler.json endpoint.

export interface Quake {
  id: string;
  /** UTC ISO time */
  time: string;
  mag: number;
  magType: string;
  depth: number;
  lat: number;
  lng: number;
  place: string;
  province: string | null;
  district: string | null;
}

// İzmir province plus the gulf and nearby coast (also catches Manisa, Aydın and the islands).
const BOX = { minlat: 37.75, maxlat: 39.45, minlon: 25.9, maxlon: 28.5 };
const API = 'https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter';

const fmt = (d: Date) => d.toISOString().slice(0, 19);

export async function fetchQuakes(days = 7): Promise<Quake[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const qs = new URLSearchParams({
    start: fmt(start), end: fmt(new Date(end.getTime() + 3_600_000)),
    minlat: String(BOX.minlat), maxlat: String(BOX.maxlat), minlon: String(BOX.minlon), maxlon: String(BOX.maxlon),
    minmag: '1', orderby: 'timedesc', limit: '1000',
  });
  const res = await fetch(`${API}?${qs}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IzmirUzmani/1.0; +https://www.izmiruzmani.com)', Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`AFAD HTTP ${res.status}`);
  const raw = (await res.json()) as Record<string, string>[];
  return raw.map((q) => ({
    id: q.eventID,
    // AFAD reports UTC without a zone suffix.
    time: `${q.date}Z`,
    mag: Number(q.magnitude),
    magType: q.type,
    depth: Number(q.depth),
    lat: Number(q.latitude),
    lng: Number(q.longitude),
    place: q.location,
    province: q.province || null,
    district: q.district || null,
  })).filter((q) => Number.isFinite(q.mag) && Number.isFinite(q.lat));
}

export const magClass = (m: number) => (m >= 5 ? 'm5' : m >= 4 ? 'm4' : m >= 3 ? 'm3' : m >= 2 ? 'm2' : 'm1');
