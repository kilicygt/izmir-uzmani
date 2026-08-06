const COOKIE = 'admin_token';
const TTL = 86400; // 24 saat

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toB64u(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromB64u(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - s.length % 4) % 4);
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

export async function createToken(secret: string): Promise<string> {
  const payload = btoa(JSON.stringify({ exp: Date.now() + TTL * 1000 }));
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${toB64u(sig)}`;
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const [payload, sigStr] = token.split('.');
    if (!payload || !sigStr) return false;
    const { exp } = JSON.parse(atob(payload));
    if (!exp || exp < Date.now()) return false;
    const key = await getKey(secret);
    return crypto.subtle.verify('HMAC', key, fromB64u(sigStr), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export function getToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? m[1] : null;
}

export function setCookie(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL}`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function requireAuth(request: Request, secret: string): Promise<boolean> {
  const token = getToken(request.headers.get('cookie'));
  return token ? verifyToken(token, secret) : false;
}
