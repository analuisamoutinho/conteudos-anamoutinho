const express = require('express');
const router  = express.Router();
const { NICHE_CONFIG, TRENDS_TTL } = require('../config');
const { getAccount, getManualText } = require('../lib/brand');
const { getAllTrends, trendsCache } = require('../lib/trends');
const { extractJSON } = require('../lib/util');
const { askOpenAI, MODEL_SMART } = require('../lib/ai');

router.get('/api/trends', async (req, res) => {
  try {
    const { profile = 'pessoal', refresh } = req.query;
    const now = Date.now();
    if (refresh !== 'true' && trendsCache[profile] && (now - trendsCache[profile].ts) < TRENDS_TTL) return res.json({ ...trendsCache[profile].data, cached: true });
    const account    = getAccount(profile);
    const nicho      = NICHE_CONFIG[profile] || NICHE_CONFIG.pessoal;
    const manualNote = getManualText(profile);
    const { items, fontes } = await getAllTrends();
    if (!items.length) return res.json({ trends: [], updatedAt: new Date().toISOString(), fontes, warning: 'Nenhuma fonte de tendências disponível neste momento.' });
    const termosList = items.map((t, i) => (i + 1) + '. [' + t.fonte + '] ' + t.termo + (t.volume ? ' (' + t.volume + ')' : '')).join('\n');
    const prompt = 'Você é estrategista de conteúdo para ' + account.name + '.\nNicho: ' + nicho + '.\n' + (manualNote ? 'Contexto:\n' + manualNote + '\n' : '') + 'Público: donos de negócio que já faturam e querem fazer a empresa crescer sem depender só do próprio esforço.\n\nAssuntos em alta agora no Brasil (Google Trends = busca; Reddit BR = conversa real e dor crua do público; Google News BR = contexto de mercado):\n\n' + termosList + '\n\nIdentifique os 6 assuntos mais relevantes para esse público. Prefira o que gera tensão real para quem tem CNPJ — não o que é apenas popular. Mantenha variedade de fontes quando fizer sentido. JSON:\n{"trends":[{"termo":"...","fonte":"Google Trends | Reddit BR | Google News BR","volume":"...","relevancia":"por que é oportuno para dono de negócio (1 frase)","angulo":"como transformar em pauta (2 frases)","tipo_ideal":"carrossel | post | reels","gancho":"headline pronta para usar","urgencia":"alta | media | baixa"}]}';
    const aiText = await askOpenAI({ prompt, model: MODEL_SMART, maxTokens: 2800, json: true });
    const parsed = extractJSON(aiText);
    const result = { trends: parsed.trends || [], updatedAt: new Date().toISOString(), fontes };
    trendsCache[profile] = { data: result, ts: now };
    res.json(result);
  } catch(err) { console.error('[Trends]', err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
