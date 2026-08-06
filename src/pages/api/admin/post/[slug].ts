export const prerender = false;
import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/admin/auth';
import { getFile, putFile, deleteFile } from '../../../../lib/admin/github';
import { parseFrontmatter, stringifyFrontmatter, calcReadTime } from '../../../../lib/admin/md';

const BLOG_DIR = 'src/content/blog';

export const GET: APIRoute = async ({ request, params }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { slug } = params;
  try {
    const file = await getFile(`${BLOG_DIR}/${slug}.md`);
    if (!file) return new Response(JSON.stringify({ error: 'Yazı bulunamadı.' }), { status: 404 });
    const { data, content } = parseFrontmatter(file.content);
    return new Response(JSON.stringify({ slug, data, content, sha: file.sha }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { slug } = params;
  try {
    const body = await request.json();
    const path = `${BLOG_DIR}/${slug}.md`;
    const existing = await getFile(path);
    if (!existing) return new Response(JSON.stringify({ error: 'Yazı bulunamadı.' }), { status: 404 });

    const tags = typeof body.tags === 'string'
      ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : (body.tags || []);

    const data = {
      title: body.title,
      description: body.description,
      pubDate: body.pubDate,
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
    await putFile(path, content, `Yazı güncellendi: ${body.title}`, existing.sha);

    return new Response(JSON.stringify({ success: true, slug }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { slug } = params;
  try {
    const path = `${BLOG_DIR}/${slug}.md`;
    const file = await getFile(path);
    if (!file) return new Response(JSON.stringify({ error: 'Yazı bulunamadı.' }), { status: 404 });
    await deleteFile(path, `Yazı silindi: ${slug}`, file.sha);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
