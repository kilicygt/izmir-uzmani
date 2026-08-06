export const prerender = false;
import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin/auth';
import { getFile, putFile } from '../../../lib/admin/github';

const CONFIG_PATH = 'src/data/site-config.json';

export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const file = await getFile(CONFIG_PATH);
    if (!file) return new Response(JSON.stringify({ error: 'Config bulunamadı.' }), { status: 404 });
    const config = JSON.parse(file.content);
    return new Response(JSON.stringify({ ...config, sha: file.sha }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { sha, ...config } = body;

    const existing = await getFile(CONFIG_PATH);
    const content = JSON.stringify(config, null, 2) + '\n';
    await putFile(CONFIG_PATH, content, 'Sayfa metinleri güncellendi', existing?.sha);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
