import type { APIRoute } from 'astro';
import { fetchQuakes } from '../../lib/deprem';

export const prerender = false;

// Live list for the /deprem page. Cached at Vercel's edge for a minute so AFAD gets at most ~1 request/min.
export const GET: APIRoute = async () => {
  try {
    const quakes = await fetchQuakes(7);
    return new Response(JSON.stringify({ updatedAt: new Date().toISOString(), quakes }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'AFAD verisine şu an ulaşılamıyor.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
};
