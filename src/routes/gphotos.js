const express = require('express');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const {
  loadGPhotoTokens,
  saveGPhotoToken,
  deleteGPhotoToken,
  getGPhotoAccessToken,
} = require('../lib/gphotos');

router.get('/api/gphotos/auth', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID não configurado' });
  const redirectUri = (process.env.PUBLIC_URL || '').replace(/\/$/, '') + '/api/gphotos/callback';
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'https://www.googleapis.com/auth/photoslibrary.readonly', access_type: 'offline', prompt: 'consent', state: req.query.userId || 'default' });
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString());
});

router.get('/api/gphotos/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code) return res.redirect('/?gphotos_error=no_code');
  const redirectUri = (process.env.PUBLIC_URL || '').replace(/\/$/, '') + '/api/gphotos/callback';
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, code, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString()
    });
    const d = await r.json();
    if (!d.access_token) { console.error('[gphotos] callback error:', JSON.stringify(d)); throw new Error(d.error_description || JSON.stringify(d)); }
    await saveGPhotoToken(userId || 'default', { access_token: d.access_token, refresh_token: d.refresh_token || null, expires_at: Date.now() + ((d.expires_in || 3600) * 1000), connected_at: new Date().toISOString() });
    res.redirect('/?gphotos_connected=1');
  } catch(e) { res.redirect('/?gphotos_error=' + encodeURIComponent(e.message)); }
});

router.get('/api/gphotos/status', async (req, res) => {
  const userId = req.query.userId || 'default';
  const tokens = await loadGPhotoTokens();
  const t = tokens[userId];
  res.json({ connected: !!t, connectedAt: t?.connected_at || null, hasRefreshToken: !!(t?.refresh_token) });
});

router.delete('/api/gphotos/disconnect', async (req, res) => {
  const userId = req.query.userId || 'default';
  await deleteGPhotoToken(userId);
  res.json({ success: true });
});

router.get('/api/gphotos/token', async (req, res) => {
  const userId = req.query.userId || 'default';
  try {
    const token = await getGPhotoAccessToken(userId);
    if (!token) return res.status(401).json({ error: 'Não autenticado' });
    res.json({ access_token: token });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/gphotos/albums', async (req, res) => {
  const userId = req.query.userId || 'default';
  const accessToken = await getGPhotoAccessToken(userId);
  if (!accessToken) return res.status(401).json({ error: 'Não autenticado. Conecte o Google Fotos primeiro.' });
  try {
    const r = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', { headers: { 'Authorization': 'Bearer ' + accessToken } });
    const d = await r.json();
    if (d.error) return res.status(400).json({ error: d.error.message });
    res.json({ albums: d.albums || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/gphotos/suggest', async (req, res) => {
  const { tema, slideIndex, totalSlides, userId = 'default', albumId, limit = 5 } = req.body;
  const accessToken = await getGPhotoAccessToken(userId);
  if (!accessToken) return res.status(401).json({ error: 'Não autenticado. Conecte o Google Fotos primeiro.' });
  try {
    let photosUrl = 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=100';
    let fetchOptions = { headers: { 'Authorization': 'Bearer ' + accessToken } };
    if (albumId) {
      photosUrl = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
      fetchOptions = { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ albumId, pageSize: 100 }) };
    }
    const r = await fetch(photosUrl, fetchOptions);
    const d = await r.json();
    if (d.error) return res.status(400).json({ error: d.error.message });
    const items = d.mediaItems || [];
    if (!items.length) return res.json({ suggestions: [], message: 'Nenhuma foto encontrada' });
    const photoList = items.slice(0, 50).map((p, i) => (i+1) + '. ID:' + p.id + ' | ' + (p.filename||'') + ' | ' + (p.description||'')).join('\n');
    const aiPrompt = 'Tema: "' + tema + '"\nSlide ' + (slideIndex+1) + ' de ' + totalSlides + '\n\nFotos:\n' + photoList + '\n\nSeleciona ' + limit + ' IDs mais adequados. JSON: {"ids":["id1","id2"]}';
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 256, messages: [{ role: 'user', content: aiPrompt }] }) });
    const aiData = await aiRes.json();
    const aiTxt = aiData.content?.[0]?.text?.trim() || '{"ids":[]}';
    const m = aiTxt.match(/\{[\s\S]*\}/);
    const parsed = m ? JSON.parse(m[0]) : { ids: [] };
    const selected = (parsed.ids || []).slice(0, limit).map(id => {
      const item = items.find(p => p.id === id);
      if (!item) return null;
      return { id: item.id, filename: item.filename, description: item.description || '', previewUrl: item.baseUrl + '=w1200', slideUrl: item.baseUrl + '=w1024-h1365-c' };
    }).filter(Boolean);
    res.json({ suggestions: selected, total: items.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/gphotos/photo/:id', async (req, res) => {
  const userId = req.query.userId || 'default';
  const accessToken = await getGPhotoAccessToken(userId);
  if (!accessToken) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const r = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems/' + req.params.id, { headers: { 'Authorization': 'Bearer ' + accessToken } });
    const d = await r.json();
    if (!d.baseUrl) return res.status(404).json({ error: 'Foto não encontrada' });
    res.json({ id: d.id, previewUrl: d.baseUrl + '=w800', slideUrl: d.baseUrl + '=w1024-h1365-c', filename: d.filename, description: d.description || '' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Proxy server-side para imagens do Google Fotos — evita CORS no canvas do frontend.
// Também aceita URLs temporárias do Google Photos como ?url=...
router.get('/api/gphotos/proxy-image', async (req, res) => {
  const userId = req.query.userId || 'default';
  const photoUrl = req.query.url;
  if (!photoUrl) return res.status(400).json({ error: 'url obrigatório' });
  // Validação mínima — só permite domínios Google Fotos
  if (!photoUrl.startsWith('https://lh3.googleusercontent.com') &&
      !photoUrl.startsWith('https://photos.google.com') &&
      !photoUrl.startsWith('https://googleusercontent.com')) {
    return res.status(403).json({ error: 'Domínio não permitido' });
  }
  const accessToken = await getGPhotoAccessToken(userId);
  if (!accessToken) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const imgRes = await fetch(photoUrl, { headers: { 'Authorization': 'Bearer ' + accessToken } });
    if (!imgRes.ok) return res.status(imgRes.status).json({ error: 'Falha ao buscar imagem' });
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
