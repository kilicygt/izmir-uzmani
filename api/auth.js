// GitHub OAuth — adım 1: GitHub login sayfasına yönlendir
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const siteUrl = process.env.SITE_URL || 'https://izmiruzmani.com';

  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID environment variable eksik.');
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/callback`,
    scope: 'repo,user',
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params}`,
  });
  res.end();
}
