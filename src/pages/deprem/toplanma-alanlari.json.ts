import type { APIRoute } from 'astro';
import data from '../../data/toplanma.json';

// Compact list for the "en yakın toplanma alanı" button, loaded only when someone presses it.
export const GET: APIRoute = () =>
  new Response(JSON.stringify(data.areas), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
