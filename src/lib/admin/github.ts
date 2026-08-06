function cfg() {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;
  const branch = import.meta.env.GITHUB_BRANCH || 'main';
  if (!token || !owner || !repo) {
    throw new Error('GitHub env eksik: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }
  return { token, owner, repo, branch };
}

function hdrs(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export interface GHFile { name: string; path: string; sha: string; type: string; }

function decodeContent(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeContent(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export async function listFiles(path: string): Promise<GHFile[]> {
  const { token, owner, repo, branch } = cfg();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: hdrs(token) }
  );
  if (!res.ok) throw new Error(`GitHub list ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getFile(path: string): Promise<{ content: string; sha: string } | null> {
  const { token, owner, repo, branch } = cfg();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: hdrs(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get ${res.status}`);
  const data = await res.json();
  return { content: decodeContent(data.content), sha: data.sha };
}

export async function putFile(
  path: string, content: string, message: string, sha?: string
): Promise<void> {
  const { token, owner, repo, branch } = cfg();
  const body: Record<string, string> = { message, content: encodeContent(content), branch };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { method: 'PUT', headers: hdrs(token), body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub put ${res.status}: ${JSON.stringify(err)}`);
  }
}

export async function putBinaryFile(
  path: string, base64Content: string, message: string, sha?: string
): Promise<void> {
  const { token, owner, repo, branch } = cfg();
  const body: Record<string, string> = { message, content: base64Content, branch };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { method: 'PUT', headers: hdrs(token), body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub putBinary ${res.status}: ${JSON.stringify(err)}`);
  }
}

export async function deleteFile(path: string, message: string, sha: string): Promise<void> {
  const { token, owner, repo, branch } = cfg();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { method: 'DELETE', headers: hdrs(token), body: JSON.stringify({ message, sha, branch }) }
  );
  if (!res.ok) throw new Error(`GitHub delete ${res.status}`);
}
