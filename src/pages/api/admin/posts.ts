export const prerender = false;
import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin/auth';
import { listFiles, getFile, putFile } from '../../../lib/admin/github';
import { parseFrontmatter, stringifyFrontmatter, calcReadTime, titleToSlug } from '../../../lib/admin/md';

const BLOG_DIR = 'src/content/blog';

export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const files = (await listFiles(BLOG_DIR)).filter(f => f.name.endsWith('.md'));
    const posts = await Promise.all(
      files.map(async (f) => {
        const slug = f.name.replace('.md', '');
        try {
          const file = await getFile(`${BLOG_DIR}/${f.name}`);
          if (!file) return null;
          const { data } = parseFrontmatter(file.content);
          return { slug, title: data.title || slug, description: data.description || '', pubDate: data.pubDate || '', category: data.category || '', featured: data.featured || false, sha: f.sha };
        } catch {
          return { slug, title: slug, description: '', pubDate: '', category: '', featured: false, sha: f.sha };
        }
      })
    );
    const sorted = posts.filter(Boolean).sort((a, b) => {
      if (!a?.pubDate || !b?.pubDate) return 0;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
    return new Response(JSON.stringify({ posts: sorted }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = body.slug || titleToSlug(body.title);
    if (!slug) return new Response(JSON.stringify({ error: 'Slug gerekli.' }), { status: 400 });

    const path = `${BLOG_DIR}/${slug}.md`;
    const existing = await getFile(path);
    if (existing) return new Response(JSON.stringify({ error: 'Bu slug zaten kullanımda.' }), { status: 409 });

    const tags = typeof body.tags === 'string'
      ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : (body.tags || []);

    const data = {
      title: body.title,
      description: body.description,
      pubDate: body.pubDate || new Date().toISOString().split('T')[0],
      category: body.category,
      readTime: body.readTime || calcReadTime(body.content || ''),
      tags,
      featured: body.featured || false,
      ...(body.image ? { image: body.image } : {}),
      ...(body.excerpt ? { excerpt: body.excerpt } : {}),
      ...(body.seoTitle ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription ? { seoDescription: body.seoDescription } : {}),
    };

    const content = stringifyFrontmatter(data, body.content || '');
    await putFile(path, content, `Yeni yazı: ${body.title}`);

    return new Response(JSON.stringify({ success: true, slug }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
