const express = require('express');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const { NICHE_CONFIG, TRENDS_TTL } = require('../config');
const { getAccount, getManualText } = require('../lib/brand');
const { getGoogleTrends, trendsCache } = require('../lib/trends');
const { extractJSON } = require('../lib/util');

router.get('/api/trends', async (req, res) => {
  try {
    const { profile = 'pessoal', refresh } = req.query;
    const now = Date.now();
    if (refresh !== 'true' && trendsCache[profile] && (now - trendsCache[profile].ts) < TRENDS_TTL) return res.json({ ...trendsCache[profile].data, cached: true });
    const account    = getAccount(profile);
    const nicho      = NICHE_CONFIG[profile] || NICHE_CONFIG.pessoal;
    const manualNote = getManualText(profile);
    const googleTrends = await getGoogleTrends();
    if (!googleTrends.length) return res.json({ trends: [], updatedAt: new Date().toISOString(), warning: 'Nenhuma fonte de tendências disponível neste momento.' });
    const termosList = googleTrends.map((t, i) => (i + 1) + '. [' + t.fonte + '] ' + t.termo + (t.volume ? ' (' + t.volume + ')' : '')).join('\n');
    const prompt = 'Você é estrategista de conteúdo para ' + account.name + '.\nNicho: ' + nicho + '.\n' + (manualNote ? 'Contexto:\n' + manualNote + '\n' : '') + 'Termos em alta agora no Brasil:\n\n' + termosList + '\n\nIdentifique os 6 termos mais relevantes para o nicho. JSON:\n{"trends":[{"termo":"...","fonte":"Google Trends","volume":"...","relevancia":"por que é oportuno (1 frase)","angulo":"como transformar em pauta (2 frases)","tipo_ideal":"carrossel | post | reels","gancho":"headline pronta para usar","urgencia":"alta | media | baixa"}]}';
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2800, messages: [{ role: 'user', content: prompt }] }) });
    const aiData = await aiRes.json();
    if (aiData.error) throw new Error(aiData.error.message);
    const parsed = extractJSON(aiData.content[0].text.trim());
    const result = { trends: parsed.trends || [], updatedAt: new Date().toISOString(), fontes: { google: googleTrends.length > 0 } };
    trendsCache[profile] = { data: result, ts: now };
    res.json(result);
  } catch(err) { console.error('[Trends]', err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
