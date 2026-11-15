// Shared by scripts/fetch-pharmacies.mjs (daily build data) and the pharmacy pages (live refresh in the browser).
// Turns the raw İzmir Büyükşehir "nöbetçi eczaneler" API response into clean, district-tagged records.

// İzmir's 30 districts with a rough centre point, used as a last-resort match by coordinates.
export const ILCELER = {
  'Aliağa': [38.80, 26.97], 'Balçova': [38.39, 27.05], 'Bayındır': [38.22, 27.65], 'Bayraklı': [38.46, 27.17],
  'Bergama': [39.12, 27.18], 'Beydağ': [38.09, 28.21], 'Bornova': [38.46, 27.22], 'Buca': [38.38, 27.17],
  'Çeşme': [38.32, 26.30], 'Çiğli': [38.50, 27.06], 'Dikili': [39.07, 26.89], 'Foça': [38.67, 26.76],
  'Gaziemir': [38.32, 27.14], 'Güzelbahçe': [38.37, 26.89], 'Karabağlar': [38.38, 27.12], 'Karaburun': [38.64, 26.51],
  'Karşıyaka': [38.46, 27.11], 'Kemalpaşa': [38.43, 27.42], 'Kınık': [39.09, 27.38], 'Kiraz': [38.23, 28.21],
  'Konak': [38.42, 27.14], 'Menderes': [38.25, 27.13], 'Menemen': [38.61, 27.07], 'Narlıdere': [38.39, 27.00],
  'Ödemiş': [38.23, 27.97], 'Seferihisar': [38.20, 26.84], 'Selçuk': [37.95, 27.37], 'Tire': [38.09, 27.73],
  'Torbalı': [38.16, 27.36], 'Urla': [38.32, 26.77],
};

// Duty regions (nöbet bölgeleri) of the İzmir Chamber of Pharmacists mapped to districts.
// A region that straddles a border lists both districts.
export const BOLGE = {
  'ALTINDAĞ': ['Bornova'], 'ATATÜRK': ['Bornova'], 'ATATÜRK OSMANGAZİ': ['Bornova'], 'PINARBAŞI': ['Bornova'],
  'ÇAMDİBİ': ['Bornova', 'Konak'], 'BALÇOVA': ['Balçova'], 'BALÇOVA 2': ['Balçova'],
  'BASIN SİTESİ': ['Karabağlar'], 'BOZYAKA': ['Karabağlar'], 'YEŞİLYURT': ['Karabağlar'], 'ESKİİZMİR-CENNETÇEŞME': ['Karabağlar'],
  'BAYRAKLI': ['Bayraklı'], 'GÜMÜŞPALA': ['Bayraklı', 'Karşıyaka'],
  'EVKA 1': ['Buca'], 'ŞİRİNYER': ['Buca'], 'GEDİZ': ['Buca', 'Karabağlar'],
  'EŞREFPAŞA': ['Konak'], 'GÜLTEPE': ['Konak'], 'ÜÇYOL': ['Konak'], 'YENİŞEHİR': ['Konak'], 'ALSANCAK': ['Konak'],
  'ALSANCAK-BASMANE': ['Konak'], 'HATAY': ['Konak'], 'MİTHATPAŞA': ['Konak'],
  'SARNIÇ': ['Gaziemir'], 'AYRANCILAR': ['Torbalı'], 'YENİ ŞAKRAN': ['Aliağa'],
  'ESKİ FOÇA': ['Foça'], 'YENİ FOÇA': ['Foça'], 'MORDOĞAN': ['Karaburun'], 'ÇANDARLI': ['Dikili'],
  'ZEYTİNALANI': ['Urla'], 'ÇEŞMEALTI-İSKELE': ['Urla'], 'ÜRKMEZ': ['Seferihisar'], 'SEFERİHİSAR-SIĞACIK BÖLGESİ': ['Seferihisar'],
};

const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR');
const ilceByName = Object.fromEntries(Object.keys(ILCELER).map((n) => [norm(n), n]));

function ilceOf(region, lat, lng) {
  const r = norm(region);
  if (BOLGE[r]) return BOLGE[r];
  // "BORNOVA 3", "MENEMEN 2", "KARŞIYAKA 1" …
  const base = r.replace(/\s*\d+$/, '');
  if (ilceByName[base]) return [ilceByName[base]];
  for (const [k, v] of Object.entries(ilceByName)) if (r.includes(k)) return [v];
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    let best = null, bestD = Infinity;
    for (const [name, [a, b]] of Object.entries(ILCELER)) {
      const d = (a - lat) ** 2 + ((b - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
      if (d < bestD) { bestD = d; best = name; }
    }
    return [best];
  }
  return [];
}

const fixEscapes = (s) => (s ?? '').replace(/u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
// Keep abbreviations like "MAH." readable: "SERINTEPE MAH. 4310 SOKAK" → "Serintepe Mah. 4310 Sokak".
// The source is often typed without a Turkish keyboard ("YENI MAH."). A plain "I" is read as "i"
// unless the same word also has "İ"/"ı", which shows its author did distinguish the two.
const lowerWord = (w) => (/[İı]/.test(w) ? w.toLocaleLowerCase('tr-TR') : w.replace(/I/g, 'i').toLocaleLowerCase('tr-TR'));
const title = (s) => fixEscapes(s).replace(/\s+/g, ' ').trim()
  .split(/(\s+)/).map(lowerWord).join('')
  .replace(/(^|[\s(/.-])(\p{L})/gu, (_, p, c) => p + c.toLocaleUpperCase('tr-TR'));
const phone = (s) => {
  const d = (s ?? '').replace(/\D/g, '').replace(/^90/, '').replace(/^(?!0)/, '0');
  return d.length === 11 ? { tel: `+90${d.slice(1)}`, label: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}` } : null;
};

// "24:00DEN SONRA- ÇAMDİBİ" → "Saat 24:00 sonrası: Çamdibi"; "24:00A KADAR" → "Saat 24:00'e kadar açık".
function dutyNote(s) {
  const t = fixEscapes(s).replace(/\s+/g, ' ').trim();
  if (!t) return null;
  const m = t.match(/(\d{1,2}[:.]\d{2})\s*'?\s*[A-ZÇĞİÖŞÜa-zçğıöşü]*\s*(SONRA|KADAR)\s*[-–]?\s*(.*)$/i);
  if (!m) return title(t);
  const time = m[1].replace('.', ':');
  const rest = m[3].replace(/\.$/, '').trim();
  if (/KADAR/i.test(m[2])) return `Saat ${time}’e kadar açık`;
  if (/İCAP|ICAP/i.test(rest)) return `Saat ${time} sonrası icap nöbeti (kapıdaki numarayı arayın)`;
  return rest ? `Saat ${time} sonrası: ${title(rest)} bölgesindeki eczane` : `Saat ${time} sonrası kapalı`;
}

const fold = (x) => x.toLocaleUpperCase('tr-TR').replace(/İ/g, 'I');
const ilceByFold = Object.fromEntries(Object.keys(ILCELER).map((n) => [fold(n), n]));
// "BAYINDIR" → "Bayındır", "BORNOVA 2" → "Bornova 2"; other regions are title-cased.
function regionName(r) {
  const t = fixEscapes(r).replace(/\s+/g, ' ').trim();
  const m = t.match(/^(.*?)(\s*\d+)?$/);
  const hit = ilceByFold[fold(m[1])];
  if (hit) return hit + (m[2] ?? '');
  // Region keys in BOLGE are spelled correctly, so prefer them over the raw text.
  const key = Object.keys(BOLGE).find((k) => fold(k) === fold(t));
  return key ? key.toLocaleLowerCase('tr-TR').replace(/(^|[\s-])(\p{L})/gu, (_, p, c) => p + c.toLocaleUpperCase('tr-TR')) : title(t);
}


const TR = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u' };
export const ilceSlug = (name) => name.toLocaleLowerCase('tr-TR').replace(/[çğıiöşü]/g, (c) => TR[c]).replace(/[^a-z0-9]+/g, '-');

export function normalizePharmacies(raw) {
  const pharmacies = raw.map((p) => {
    // The API swaps the axis names: LokasyonX is latitude, LokasyonY is longitude.
    const lat = parseFloat(p.LokasyonX), lng = parseFloat(p.LokasyonY);
    const note = dutyNote(p.BolgeAciklama);
    return {
      name: title(p.Adi),
      region: regionName(p.Bolge),
      note: note || null,
      address: title(p.Adres),
      phone: phone(p.Telefon),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      ilceler: ilceOf(p.Bolge, lat, lng),
    };
  }).sort((a, b) => a.ilceler[0]?.localeCompare(b.ilceler[0] ?? '', 'tr') || a.region.localeCompare(b.region, 'tr'));

  const dutyStart = raw.map((p) => p.Tarih).filter(Boolean).sort().at(-1) ?? null;
  return { dutyStart, pharmacies };
}
