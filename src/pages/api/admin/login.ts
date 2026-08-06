export const prerender = false;
import type { APIRoute } from 'astro';
import { createToken, setCookie } from '../../../lib/admin/auth';

export const POST: APIRoute = async ({ request }) => {
  const { username, password } = await request.json().catch(() => ({}));

  const validUser = import.meta.env.ADMIN_USERNAME || 'admin';
  const validPass = import.meta.env.ADMIN_PASSWORD;
  const secret = import.meta.env.ADMIN_SECRET;

  if (!validPass || !secret) {
    return new Response(JSON.stringify({ error: 'Sunucu yapılandırması eksik.' }), { status: 500 });
  }

  if (username !== validUser || password !== validPass) {
    return new Response(JSON.stringify({ error: 'Kullanıcı adı veya şifre hatalı.' }), { status: 401 });
  }

  const token = await createToken(secret);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Set-Cookie': setCookie(token), 'Content-Type': 'application/json' },
  });
};
