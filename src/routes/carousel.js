const express = require('express');
const fs      = require('fs');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const { UPLOADS_DIR } = require('../config');
const { supabase } = require('../lib/supabase');
const { getAccount, BRAND_IDENTITIES } = require('../lib/brand');
const { buildSystemPromptCarrossel } = require('../lib/methodology');
const { extractJSON } = require('../lib/util');
const { saveGeneratedContent } = require('../lib/content');
const { buildCarouselPrompt, cropTo45 } = require('../lib/image');
const { resolveQuality } = require('../lib/userSettings');
const { loadCT, matchBestTemplate, templateStyle } = require('../lib/canva');

// ═══════════════════════════════════════════════════════════════════════════
// CAROUSEL GENERATE AND SAVE
// ═══════════════════════════════════════════════════════════════════════════

router.post('/api/carousel/generate-and-save', async (req, res) => {
  try {
    const { topic, blocks, profile, calendarDay, calendarMonth, calendarYear, caption, hashtags, contentMachineType } = req.body;
    const account = getAccount(profile);
    const mode    = blocks ? 'blocks' : 'topic';
    const systemPrompt = buildSystemPromptCarrossel(profile);
    let prompt;
    if (mode === 'blocks') {
      prompt = `Perfil: ${account.name} (${account.handle})
Converte estes blocos em slides de carrossel. Para cada bloco, gera um heading curto e direto + um body com 2-3 frases que desenvolvem o conceito com substância real (dado concreto, explicação, exemplo ou consequência prática). NUNCA deixar body vazio.

BLOCOS:
${blocks}

JSON: {"title":"título do carrossel","slideCount":N,"slides":[{"slideNumber":1,"funcao":"CAPA","heading":"título curto e impactante","body":"2-3 frases que desenvolvem o conceito com substância real. Inclui dado, explicação ou consequência concreta.","imagePrompt":"visual scene in english"}],"caption":"legenda completa com emojis e CTA","hashtags":"máximo 4 hashtags específicas"}`;
    } else {
      prompt = `Perfil: ${account.name} (${account.handle})
Tema: "${topic}"
Total: 7-8 slides.
ESTRUTURA RR: Slide 1 (gancho que nomeia dor/desejo real, com 1-2 concordes) → slides de profundidade cumprindo uma função do Pilar 4 (Ramificações) → conclusão com tese → CTA seguindo o Pilar 5 (permissão, triagem ou filtro).

REGRA CRÍTICA: cada slide DEVE ter body com 2-3 frases de conteúdo real — dado concreto, explicação do conceito, exemplo prático ou consequência. NUNCA body vazio ou com menos de 2 frases.

JSON: {"title":"título do carrossel","slideCount":8,"slides":[{"slideNumber":1,"funcao":"CAPA","heading":"gancho de 14-18 palavras","body":"2-3 frases que desenvolvem o gancho com substância. Dado concreto, padrão de mercado real ou consequência.","imagePrompt":"visual scene in english"},{"slideNumber":2,"funcao":"DESENVOLVIMENTO","heading":"título do conceito","body":"2-3 frases explicando o conceito com dado ou exemplo concreto. O leitor deve aprender algo real neste slide.","imagePrompt":"visual scene in english"}],"caption":"legenda completa com emojis e CTA","hashtags":"máximo 4 hashtags específicas ao nicho"}`;
    }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 8192, system: systemPrompt, messages: [{ role: 'user', content: prompt }] }),
    });
    const d = await r.json();
    if (d.error) return res.status(500).json({ error: d.error.message });
    const carouselData = extractJSON(d.content[0].text.trim());
    function sanitizeCopy(text) { if (!text) return text; return text.replace(/\s*—\s*/g, ' ').replace(/\s*–\s*/g, ' ').replace(/^\s*[–—]\s*/gm, '').trim(); }
    if (carouselData.slides) { carouselData.slides = carouselData.slides.map(s => ({ ...s, heading: sanitizeCopy(s.heading), body: sanitizeCopy(s.body) })); }
    if (carouselData.hashtags) { const tags = carouselData.hashtags.match(/#[\wÀ-ɏ]+/g) || []; carouselData.hashtags = tags.slice(0, 4).join(' '); }
    const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'carrossel', mode, profile, topic: topic || ('Carrossel ' + carouselData.slideCount + ' slides'), caption: caption || carouselData.caption, hashtags: hashtags || carouselData.hashtags, contentMachineType: contentMachineType || null, carouselData, calendarDay: calendarDay || null, calendarMonth: calendarMonth || null, calendarYear: calendarYear || null, imageUrls: [], metodologia: 'rr' });
    res.json({ success: true, contentId: item.id, ...carouselData });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// Geracao de imagem por slide (GPT Image-1)
// Aceita referenceImageB64 (base64 sem prefixo) para usar a foto real do Google Fotos como base
router.post('/api/image/carousel-slide', async (req, res) => {
  try {
    const { heading, body, slideNumber, totalSlides, funcao, topic, profile, contentId, imagePromptHint, designStyleHint, templateId, quality: rawQuality, referenceImageB64, engine } = req.body;
    if (engine === 'none') return res.json({ success: true, b64: null, url: null, designMeta: {}, quality: 'none' });
    const quality = resolveQuality(rawQuality);
    const brand = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;
    const account = getAccount(profile);
    const sceneHint = imagePromptHint || topic || '';

    // Template do banco: explícito (templateId) ou auto-match pelo conteúdo.
    // O designStyleHint manual continua a ter prioridade máxima.
    let matchedTemplate = null;
    if (!designStyleHint) {
      if (templateId) matchedTemplate = loadCT().find(t => t.id === templateId) || null;
      if (!matchedTemplate) {
        matchedTemplate = await matchBestTemplate({
          tipo: 'carrossel',
          tema: topic || heading || '',
          slides: [{ heading }],
          profile: profile || 'pessoal',
          cacheKey: contentId || null,
        }).catch(() => null);
      }
    }
    const aestheticOverride = designStyleHint || (matchedTemplate ? templateStyle(matchedTemplate) : null);

    const promptPhoto = buildCarouselPrompt({
      quality,
      brand,
      aestheticOverride,
      slideRole: funcao,
      heading, body,
      slideNumber: slideNumber || 1,
      totalSlides: totalSlides || 1,
      sceneHint,
    });
    const moodList = brand.moods || ['HERO_DARK'];
    const moodIndex = Math.min((slideNumber || 1) - 1, moodList.length - 1);
    const mood = moodList[moodIndex] || 'HERO_DARK';
    const isDark = mood.includes('DARK') || mood.includes('LOFI') || mood.includes('WARM') || mood === 'FRASE_IMPACTO' || mood === 'VIRADA' || mood === 'CTA_INTIMO';
    const designMeta = { heading: heading||'', body: body||'', accent: brand.accent||'#C8A020', bgDark: brand.bgDark||'#0A0A0A', bgLight: brand.bgLight||'#F5F4F0', handle: brand.handle||account.handle, isDark, mood, slideNumber, totalSlides, funcao: funcao||(slideNumber===1?'CAPA':slideNumber===totalSlides?'ASSINATURA':'CONTEUDO'), templateId: matchedTemplate?.id || null, templateName: matchedTemplate?.name || null };

    let imageData;

    if (referenceImageB64) {
      // Usa a foto real como imagem de entrada via edits endpoint
      const imgBuffer = Buffer.from(referenceImageB64, 'base64');
      const { FormData: NodeFormData, Blob: NodeBlob } = await import('node:buffer').catch(() => ({}));
      const FormDataLib = (typeof FormData !== 'undefined') ? FormData : (await import('formdata-node').catch(() => null))?.FormData;
      const form = new (FormDataLib || FormData)();
      form.append('model', 'gpt-image-1');
      form.append('prompt', promptPhoto + ' Keep the person/subject from the reference photo as the main element. Apply the brand editorial style on top.');
      form.append('n', '1');
      form.append('size', '1024x1536');
      form.append('quality', quality);
      // Envia a imagem como ficheiro PNG
      const blob = new Blob([imgBuffer], { type: 'image/png' });
      form.append('image', blob, 'photo.png');
      const r = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
        body: form,
      });
      const data = await r.json();
      if (data.error) {
        console.warn('[carousel-slide] edits falhou, fallback para generations:', data.error.message);
        // Fallback: gera normalmente sem a foto
        const r2 = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-image-1', prompt: promptPhoto, n: 1, size: '1024x1536', quality, output_format: 'png' }) });
        const data2 = await r2.json();
        if (data2.error) return res.status(500).json({ error: data2.error.message });
        imageData = data2.data?.[0];
      } else {
        imageData = data.data?.[0];
      }
    } else {
      const r = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-image-1', prompt: promptPhoto, n: 1, size: '1024x1536', quality, output_format: 'png' }) });
      const data = await r.json();
      if (data.error) { console.error('[carousel-slide] GPT error:', data.error); return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) }); }
      imageData = data.data?.[0];
    }

    if (!imageData) return res.status(500).json({ error: 'Nenhuma imagem retornada' });

    // Crop center 2:3 → 4:5 for Instagram feed (1080×1350)
    let finalB64 = imageData.b64_json || null;
    if (finalB64) {
      finalB64 = await cropTo45(finalB64);
    }

    res.json({ success: true, b64: finalB64, url: imageData.url || null, designMeta, quality });
  } catch (err) { console.error('[image/carousel-slide]', err); res.status(500).json({ error: err.message }); }
});
// Salva imagem base64 em disco e devolve URL pública
router.post('/api/image/save-b64', async (req, res) => {
  try {
    const { b64, contentId, slideIndex } = req.body;
    if (!b64) return res.status(400).json({ error: 'b64 obrigatório' });
    const filename = `${contentId || 'img'}_slide${slideIndex ?? 0}_${Date.now()}.png`;
    const buffer = Buffer.from(b64, 'base64');

    // Preferimos Supabase Storage — funciona em qualquer plataforma (Railway, Vercel, etc),
    // já que serverless (Vercel) não tem disco persistente/servível fora de /tmp.
    if (supabase) {
      const { error } = await supabase.storage
        .from('photos')
        .upload('generated/' + filename, buffer, { contentType: 'image/png', upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('photos').getPublicUrl('generated/' + filename);
        if (data?.publicUrl) return res.json({ success: true, url: data.publicUrl, filename });
      }
      console.warn('[image/save-b64] Supabase upload falhou, a usar fallback local.');
    }

    // Fallback local (só funciona em hosts com disco persistente, ex: Railway)
    const uploadsDir = path.join(UPLOADS_DIR, 'public');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '') + '/uploads-generated/' + filename;
    res.json({ success: true, url: publicUrl, filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
