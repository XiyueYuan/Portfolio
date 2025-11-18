module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  try {
    const base = process.env.BACKEND_BASE_URL;
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    const body = raw ? JSON.parse(raw) : {};

    if (!base) {
      res.status(200).end(JSON.stringify({ ok: true, received: body }));
      return;
    }

    const forward = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await forward.text();
    res.status(forward.status).end(text);
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Upstream error' }));
  }
};
