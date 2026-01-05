import db from '../lib/db';

export async function GET({ site }: { site: URL }) {
    const categories = ['Yeme-İçme', 'Etkinlikler', 'Gezi', 'Sanat', 'Gece Hayatı', 'Oteller', 'Müzeler', 'Diğer'];
    const baseUrl = site.origin;

    // Static Pages
    const staticPages = [
        '',
        '/blog',
        '/etkinlikler',
        '/iletisim',
    ];

    // Initialize URL collection
    const urls: { loc: string; lastmod: string; priority: number }[] = [];

    // Add Static Pages
    staticPages.forEach(path => {
        urls.push({
            loc: `${baseUrl}${path}`,
            lastmod: new Date().toISOString(),
            priority: path === '' ? 1.0 : 0.8
        });
    });

    // Add Category Pages
    categories.forEach(cat => {
        urls.push({
            loc: `${baseUrl}/blog/kategori/${encodeURIComponent(cat)}`,
            lastmod: new Date().toISOString(),
            priority: 0.7
        });
    });

    // Add Dynamic Posts
    try {
        const result = await db.execute('SELECT slug, created_at FROM posts ORDER BY created_at DESC');
        const posts = result.rows as any[];

        posts.forEach(post => {
            urls.push({
                loc: `${baseUrl}/blog/${post.slug}`,
                lastmod: new Date(post.created_at).toISOString(),
                priority: 0.6
            });
        });
    } catch (error) {
        console.error('Sitemap DB Error:', error);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${url.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
