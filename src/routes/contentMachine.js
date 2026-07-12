const express = require('express');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const { getAccount, getManualText, BRAND_IDENTITIES } = require('../lib/brand');
const {
  getMetodologia,
  buildSystemPromptContentMachine,
  TIPOS_VIDEO_RR_SERVER,
  buildPromptRoteiro,
} = require('../lib/methodology');
const { extractJSON } = require('../lib/util');
const { normalizeSlidesFromGPT } = require('../lib/image');
const { saveGeneratedContent } = require('../lib/content');

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MACHINE
// ═══════════════════════════════════════════════════════════════════════════

router.post('/api/content-machine/generate', async (req, res) => {
  try {
    const { tipo, tema, profile } = req.body;
    if (!tipo || !tema) return res.status(400).json({ error: 'Faltam campos: tipo e tema.' });
    const { tipos } = getMetodologia();
    const account = getAccount(profile);
    const brand   = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;
    if (!tipos[tipo]) return res.status(400).json({ error: 'Tipo "' + tipo + '" não disponível. Disponíveis: ' + Object.keys(tipos).join(', ') });
    const tipoInfo   = tipos[tipo];
    const manualNote = getManualText(profile);
    const isVideo    = TIPOS_VIDEO_RR_SERVER.includes(tipo);
    if (isVideo) {
      const { systemPrompt, userPrompt } = buildPromptRoteiro(tipo, tema, account, tipoInfo, manualNote, brand);
      const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o', temperature: 1.0, max_tokens: 3000, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }) });
      const data = await response.json();
      if (data.error) return res.status(500).json({ error: data.error.message });
      const parsed = extractJSON(data.choices[0].message.content.trim());
      const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'reels', contentMachineType: tipo, contentMachineTypeLabel: tipoInfo.label, profile, topic: tema, imageUrls: [], metodologia: 'rr', isRoteiro: true, roteiroData: parsed });
      return res.json({ success: true, contentId: item.id, isRoteiro: true, ...parsed });
    }
    const systemPrompt = buildSystemPromptContentMachine(profile, tipo);
    const instrucaoEstrutura = 'INSTRUÇÃO: ' + tipoInfo.instrucao + '\nESTRUTURA RR: Slide 1 (gancho dor/desejo, com concordes) → desenvolvimento cumprindo uma função do Pilar 4 → conclusão → CTA seguindo o Pilar 5 (permissão, triagem ou filtro).';
    const userPrompt = 'Tipo: ' + tipoInfo.label + '\nPerfil: ' + account.name + ' (' + account.handle + ')\nTema: "' + tema + '"\n\n' + instrucaoEstrutura + '\n\nJSON:\n{"tipo":"' + tipo + '","tipo_label":"' + tipoInfo.label + '","tema":"' + tema + '","profile":"' + profile + '","metodologia":"rr","isRoteiro":false,"slides":[{"slide":1,"funcao":"CAPA","textos":[{"posicao":1,"tipo":"hook","texto":"..."},{"posicao":2,"tipo":"sub-hook","texto":"..."}]},{"slide":2,"funcao":"DESENVOLVIMENTO","textos":[{"posicao":3,"tipo":"titulo","texto":"..."},{"posicao":4,"tipo":"paragrafo","texto":"..."}]},{"slide":8,"funcao":"CTA","textos":[{"posicao":15,"tipo":"cta","texto":"..."}]}]}';
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o', temperature: 1.0, max_tokens: 4500, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }) });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const parsed = extractJSON(data.choices[0].message.content.trim());
    const slidesNorm = normalizeSlidesFromGPT(parsed, tema);
    if (slidesNorm.length === 0) return res.status(500).json({ error: 'A IA não retornou slides válidos. Tente novamente com um tema mais específico.' });
    const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'carrossel', contentMachineType: tipo, contentMachineTypeLabel: tipoInfo.label, profile, topic: tema, imageUrls: [], metodologia: 'rr', isRoteiro: false, carouselData: { title: tema, slideCount: slidesNorm.length, slides: slidesNorm, caption: '', hashtags: '' } });
    res.json({ success: true, contentId: item.id, isRoteiro: false, ...parsed, slidesNormalizados: slidesNorm });
  } catch(err) { console.error('Content Machine error:', err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
