// GitHub OAuth — adım 2: kodu token ile değiştir, CMS'e gönder
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('GitHub OAuth kodu bulunamadı.');
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send('OAuth environment variables eksik.');
    return;
  }

  let token;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = await tokenRes.json();
    token = data.access_token;
  } catch (err) {
    res.status(500).send('GitHub ile bağlantı kurulamadı.');
    return;
  }

  if (!token) {
    res.status(401).send('GitHub erişim tokeni alınamadı.');
    return;
  }

  // Decap CMS'in beklediği postMessage handshake:
  // 1. Popup → opener: "authorizing:github"
  // 2. Opener → popup: herhangi bir mesaj (origin doğrulaması için)
  // 3. Popup → opener: "authorization:github:success:{...}"
  const payload = JSON.stringify({ token, provider: 'github' });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Giriş yapılıyor...</title></head>
<body>
<p style="font-family:sans-serif;color:#555;margin:40px auto;text-align:center">
  Giriş yapılıyor, lütfen bekleyin...
</p>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload}',
      e.origin
    );
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`);
}
