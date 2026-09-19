/**
 * Vercel Serverless Function — /api/chat
 *
 * Proxies the chat message to the n8n webhook server-side so the browser
 * never touches n8n directly (no CORS). Mirrors the Express chat.routes.js
 * logic for production use on Vercel.
 */

const N8N_WEBHOOK_URL =
  'https://masumrezamunna.app.n8n.cloud/webhook/82c06985-3684-4bab-a047-1558f36d7961/chat';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `n8n responded with ${response.status}`,
        detail: text,
      });
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.json({ output: text });
    }
  } catch (err) {
    console.error('[chat proxy] Error:', err.message);
    return res.status(502).json({ error: 'Failed to reach n8n', detail: err.message });
  }
}
