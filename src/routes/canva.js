const express = require('express');
const router  = express.Router();
const { loadCT, saveCT, templateStyle } = require('../lib/canva');
const { buildCarouselPrompt } = require('../lib/image');
const { resolveQuality } = require('../lib/userSettings');
const { BRAND_IDENTITIES } = require('../lib/brand');
const { askOpenAI, generateImage, MODEL_FAST } = require('../lib/ai');

router.get('/api/canva/templates', (req, res) => { let t = loadCT(); if (req.query.profile) t = t.filter(x => !x.profile || x.profile === req.query.profile || x.profile === 'all'); res.json(t); });
router.post('/api/canva/templates', (req, res) => { const t = loadCT(); const n = { id: 'tmpl_' + Date.now(), createdAt: new Date().toISOString(), ...req.body }; t.unshift(n); saveCT(t); res.json({ success: true, template: n }); });
router.patch('/api/canva/templates/:id', (req, res) => { const t = loadCT(); const i = t.findIndex(x => x.id === req.params.id); if (i === -1) return res.status(404).json({ error: 'nao encontrado' }); t[i] = { ...t[i], ...req.body, id: req.params.id }; saveCT(t); res.json({ success: true, template: t[i] }); });
router.delete('/api/canva/templates/:id', (req, res) => { saveCT(loadCT().filter(x => x.id !== req.params.id)); res.json({ success: true }); });
router.post('/api/canva/match', async (req, res) => {
  try {
    const { contentId, tipo, tema, slides, legenda, profile } = req.body;
    const templates = loadCT().filter(t => !t.profile || t.profile === profile || t.profile === 'all');
    if (!templates.length) return res.json({ matches: [], message: 'Nenhum template cadastrado.' });
    const templateList = templates.map((t, i) => (i+1) + '. ID: ' + t.id + '\n   Nome: ' + t.name + '\n   Tipos: ' + (Array.isArray(t.contentTypes)?t.contentTypes.join(', '):t.contentTypes||'geral') + '\n   Estetica: ' + (t.aesthetic||'-') + '\n   Slides: ' + (t.slideCount||'?')).join('\n\n');
    const slidesResumo = Array.isArray(slides) ? slides.slice(0,3).map((s,i)=>'  Slide '+(i+1)+' ['+( s.funcao||'')+'] : "'+( s.heading||'').slice(0,60)+'"').join('\n') : '';
    const prompt = 'Perfil: ' + profile + '\nTipo: ' + (tipo||'autoral') + '\nTema: ' + tema + '\nSlides:\n' + slidesResumo + '\n\nTemplates:\n' + templateList + '\n\nSeleciona os 3 mais adequados. JSON: {"matches":[{"templateId":"tmpl_xxx","score":95,"reason":"1 frase","fitLabel":"Perfeito","fieldMapping":{"headline":"texto slide 1"}}]}';
    const raw = await askOpenAI({ prompt, model: MODEL_FAST, maxTokens: 1200, json: true });
    const jm = raw.match(/\{[\s\S]*\}/); const parsed = jm ? JSON.parse(jm[0]) : { matches: [] };
    const enriched = (parsed.matches||[]).map(m => { const tmpl = templates.find(t=>t.id===m.templateId); return tmpl ? {...m, template:tmpl} : null; }).filter(Boolean);
    res.json({ matches: enriched });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/api/canva/prepare-texts', (req, res) => {
  try {
    const { slides=[], legenda='', hashtags='', templateId, fieldMapping={} } = req.body;
    const templates = loadCT(); const tmpl = templates.find(t=>t.id===templateId);
    const lines = [];
    if (Object.keys(fieldMapping).length > 0) { Object.entries(fieldMapping).forEach(([f,v])=>lines.push('[ ' + f.toUpperCase() + ' ]\n' + v)); }
    else { slides.forEach((s,i)=>{ if(s.heading)lines.push('[ SLIDE ' + (i+1) + ' TITULO ]\n' + s.heading); if(s.body)lines.push('[ SLIDE ' + (i+1) + ' CORPO ]\n' + s.body); }); }
    if (legenda) lines.push('[ LEGENDA ]\n' + legenda); if (hashtags) lines.push('[ HASHTAGS ]\n' + hashtags);
    const fullText = lines.join('\n\n──────────\n\n');
    const structured = slides.map((s,i)=>({slideNumber:i+1,funcao:s.funcao||'',fields:[s.heading?{label:'Titulo',value:s.heading,key:'slide'+(i+1)+'_heading'}:null,s.body?{label:'Corpo',value:s.body,key:'slide'+(i+1)+'_body'}:null].filter(Boolean)}));
    res.json({ success:true, clipboardText:fullText, structured, canvaUrl:tmpl&&tmpl.canvaUrl||null, templateName:tmpl&&tmpl.name||'Template' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════
// CANVA TEMPLATE SLIDE GENERATOR
// POST /api/canva/generate-slides
// Gera imagens PNG de cada slide no estilo visual do template escolhido
// ═══════════════════════════════════════════════════════════════════════════

router.post('/api/canva/generate-slides', async (req, res) => {
  try {
    const { templateId, slides, profile, quality: rawQuality } = req.body;

    if (!templateId) return res.status(400).json({ error: 'templateId obrigatório' });
    if (!slides || !slides.length) return res.status(400).json({ error: 'slides obrigatório' });

    const quality = resolveQuality(rawQuality);
    const templates = loadCT();
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return res.status(404).json({ error: 'Template não encontrado' });

    const aesthetic = templateStyle(tmpl) || 'editorial clean, Instagram carousel';
    const templateName = tmpl.name || 'Template';
    const notes = tmpl.notes || '';
    const results = [];

    const brand = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideNumber = slide.slideNumber || slide.slide || (i + 1);
      const totalSlides = slides.length;
      const heading = slide.heading || (slide.textos && slide.textos[0]?.texto) || '';
      const body    = slide.body    || (slide.textos && slide.textos[1]?.texto) || '';
      const funcao  = slide.funcao  || (i === 0 ? 'CAPA' : i === slides.length - 1 ? 'CTA' : 'DESENVOLVIMENTO');

      // Template-specific aesthetic appended to brand DNA
      const aestheticOverride = [aesthetic, notes].filter(Boolean).join('. ');

      const imagePrompt = buildCarouselPrompt({
        quality,
        brand,
        aestheticOverride,
        slideRole: funcao,
        heading, body,
        slideNumber,
        totalSlides,
        sceneHint: '',
      });

      try {
        const img = await generateImage({ prompt: imagePrompt, size: '1024x1536', quality });
        results.push({
          slideNumber,
          funcao,
          heading,
          body,
          b64: img.b64,
          url: img.url,
          prompt: imagePrompt,
          overlayStyle: tmpl.overlayStyle || 'editorial',
          overlayTokens: tmpl.overlayTokens || null,
        });
      } catch (slideErr) {
        results.push({ slideNumber, error: slideErr.message, b64: null });
      }
    }

    const ok = results.filter(r => r.b64 || r.url).length;
    res.json({
      success: true,
      templateName,
      aesthetic,
      quality,
      total: slides.length,
      generated: ok,
      slides: results,
    });
  } catch (err) {
    console.error('[canva/generate-slides]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
