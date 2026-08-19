const express = require('express');
const router  = express.Router();
const { getAccount, getManualText, BRAND_IDENTITIES } = require('../lib/brand');
const {
  getMetodologia,
  buildSystemPromptContentMachine,
  TIPOS_VIDEO_BD_SERVER,
  buildPromptRoteiro,
} = require('../lib/methodology');
const { extractJSON } = require('../lib/util');
const { askOpenAI, MODEL_SMART } = require('../lib/ai');
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
    const isVideo    = TIPOS_VIDEO_BD_SERVER.includes(tipo);
    if (isVideo) {
      const { systemPrompt, userPrompt } = buildPromptRoteiro(tipo, tema, account, tipoInfo, manualNote, brand);
      const text = await askOpenAI({ prompt: userPrompt, system: systemPrompt, model: MODEL_SMART, maxTokens: 3000, json: true });
      const parsed = extractJSON(text);
      const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'reels', contentMachineType: tipo, contentMachineTypeLabel: tipoInfo.label, profile, topic: tema, imageUrls: [], metodologia: 'bd', isRoteiro: true, roteiroData: parsed });
      return res.json({ success: true, contentId: item.id, isRoteiro: true, ...parsed });
    }
    const systemPrompt = buildSystemPromptContentMachine(profile, tipo);
    const instrucaoEstrutura = 'INSTRUÇÃO: ' + tipoInfo.instrucao + '\nESTRUTURA BRANDSDECODED: capa com hook (14-18 palavras) + subhook (8-12 palavras) → desenvolvimento com dados, mecanismo e exemplo concreto → fechamento real → CTA direto e específico.';
    const userPrompt = 'Tipo: ' + tipoInfo.label + '\nPerfil: ' + account.name + ' (' + account.handle + ')\nTema: "' + tema + '"\n\n' + instrucaoEstrutura + '\n\nJSON:\n{"tipo":"' + tipo + '","tipo_label":"' + tipoInfo.label + '","tema":"' + tema + '","profile":"' + profile + '","metodologia":"bd","isRoteiro":false,"slides":[{"slide":1,"funcao":"CAPA","textos":[{"posicao":1,"tipo":"hook","texto":"..."},{"posicao":2,"tipo":"sub-hook","texto":"..."}]},{"slide":2,"funcao":"DESENVOLVIMENTO","textos":[{"posicao":3,"tipo":"titulo","texto":"..."},{"posicao":4,"tipo":"paragrafo","texto":"..."}]},{"slide":8,"funcao":"CTA","textos":[{"posicao":15,"tipo":"cta","texto":"..."}]}]}';
    const text = await askOpenAI({ prompt: userPrompt, system: systemPrompt, model: MODEL_SMART, maxTokens: 4500, json: true });
    const parsed = extractJSON(text);
    const slidesNorm = normalizeSlidesFromGPT(parsed, tema);
    if (slidesNorm.length === 0) return res.status(500).json({ error: 'A IA não retornou slides válidos. Tente novamente com um tema mais específico.' });
    const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'carrossel', contentMachineType: tipo, contentMachineTypeLabel: tipoInfo.label, profile, topic: tema, imageUrls: [], metodologia: 'bd', isRoteiro: false, carouselData: { title: tema, slideCount: slidesNorm.length, slides: slidesNorm, caption: '', hashtags: '' } });
    res.json({ success: true, contentId: item.id, isRoteiro: false, ...parsed, slidesNormalizados: slidesNorm });
  } catch(err) { console.error('Content Machine error:', err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
