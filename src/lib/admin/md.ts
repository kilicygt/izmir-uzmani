export interface PostData {
  title: string;
  description: string;
  pubDate: string;
  category: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  image?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export function parseFrontmatter(raw: string): { data: Partial<PostData>; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const data: Record<string, any> = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      data[key] = val.slice(1, -1).replace(/\\"/g, '"');
    } else if (val === 'true') { data[key] = true; }
    else if (val === 'false') { data[key] = false; }
    else if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else { data[key] = val; }
  }
  return { data: data as Partial<PostData>, content: m[2] || '' };
}

export function stringifyFrontmatter(data: Partial<PostData>, content: string): string {
  const lines = ['---'];
  const order: (keyof PostData)[] = [
    'title', 'description', 'pubDate', 'category', 'readTime',
    'tags', 'featured', 'image', 'excerpt', 'seoTitle', 'seoDescription',
  ];
  for (const key of order) {
    const val = (data as any)[key];
    if (val === undefined || val === null || val === '') continue;
    if (typeof val === 'string') lines.push(`${key}: "${val.replace(/"/g, '\\"')}"`);
    else if (typeof val === 'boolean') lines.push(`${key}: ${val}`);
    else if (Array.isArray(val) && val.length) lines.push(`${key}: [${val.filter(Boolean).map(v => `"${v}"`).join(', ')}]`);
    else if (!Array.isArray(val)) lines.push(`${key}: ${val}`);
  }
  lines.push('---', '', content.trimStart());
  return lines.join('\n');
}

export function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} dk`;
}

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
