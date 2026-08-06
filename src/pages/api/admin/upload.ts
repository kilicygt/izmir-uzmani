export const prerender = false;
import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin/auth';
import { getFile, putBinaryFile } from '../../../lib/admin/github';

const UPLOAD_DIR = 'public/images/uploads';

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.ADMIN_SECRET || '';
  if (!(await requireAuth(request, secret))) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return new Response(JSON.stringify({ error: 'Dosya bulunamadı.' }), { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    if (!allowed.includes(ext)) {
      return new Response(JSON.stringify({ error: 'Desteklenmeyen format.' }), { status: 400 });
    }

    const slug = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${slug}-${Date.now()}.${ext}`;
    const ghPath = `${UPLOAD_DIR}/${filename}`;

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const base64 = btoa(bin);

    const existing = await getFile(ghPath).catch(() => null);
    await putBinaryFile(ghPath, base64, `Görsel yüklendi: ${filename}`, existing?.sha);

    return new Response(JSON.stringify({ success: true, path: `/images/uploads/${filename}` }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
