const express = require('express');
const fs      = require('fs');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const { UPLOADS_DIR } = require('../config');
const { supabase } = require('../lib/supabase');
const { getAccount, BRAND_IDENTITIES } = require('../lib/brand');
const { buildSystemPromptCarrossel } = require('../lib/methodology');
const { extractJSON, requireOpenAIKey } = require('../lib/util');
const { saveGeneratedContent } = require('../lib/content');
const { buildCarouselPrompt, cropTo45 } = require('../lib/image');
const { resolveQuality, proximaVariacaoFeed } = require('../lib/userSettings');
const { loadCT, matchBestTemplate, templateStyle } = require('../lib/canva');
const { askOpenAI, generateImage, MODEL_SMART, IMAGE_MODEL } = require('../lib/ai');

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

JSON: {"title":"título do carrossel","slideCount":N,"slides":[{"slideNumber":1,"funcao":"CAPA","anotacao":"observação específica de até 12 palavras que comenta a evidência do slide, ou null","heading":"título curto e impactante","body":"2-3 frases que desenvolvem o conceito com substância real. Inclui dado, explicação ou consequência concreta.","imagePrompt":"visual scene in english"}],"caption":"legenda completa com emojis e CTA","hashtags":"máximo 4 hashtags específicas"}`;
    } else {
      prompt = `Perfil: ${account.name} (${account.handle})
Tema: "${topic}"
Total: 7-8 slides.
ESTRUTURA RR: Slide 1 (gancho que nomeia dor/desejo real, com 1-2 concordes) → slides de profundidade cumprindo uma função do Pilar 4 (Ramificações) → conclusão com tese → CTA seguindo o Pilar 5 (permissão, triagem ou filtro).

REGRA CRÍTICA: cada slide DEVE ter body com 2-3 frases de conteúdo real — dado concreto, explicação do conceito, exemplo prático ou consequência. NUNCA body vazio ou com menos de 2 frases.

JSON: {"title":"título do carrossel","slideCount":8,"slides":[{"slideNumber":1,"funcao":"CAPA","anotacao":"observação específica de até 12 palavras que comenta a evidência do slide, ou null","heading":"gancho de 14-18 palavras","body":"2-3 frases que desenvolvem o gancho com substância. Dado concreto, padrão de mercado real ou consequência.","imagePrompt":"visual scene in english"},{"slideNumber":2,"funcao":"DESENVOLVIMENTO","heading":"título do conceito","body":"2-3 frases explicando o conceito com dado ou exemplo concreto. O leitor deve aprender algo real neste slide.","imagePrompt":"visual scene in english"}],"caption":"legenda completa com emojis e CTA","hashtags":"máximo 4 hashtags específicas ao nicho"}`;
    }
    const text = await askOpenAI({ prompt, system: systemPrompt, model: MODEL_SMART, maxTokens: 8192, json: true });
    const carouselData = extractJSON(text);
    // Variação do feed: alterna a cada carrossel para o grid formar xadrez.
    const feedVariacao = proximaVariacaoFeed();
    function sanitizeCopy(text) { if (!text) return text; return text.replace(/\s*—\s*/g, ' ').replace(/\s*–\s*/g, ' ').replace(/^\s*[–—]\s*/gm, '').trim(); }
    if (carouselData.slides) { carouselData.slides = carouselData.slides.map(s => ({ ...s, heading: sanitizeCopy(s.heading), body: sanitizeCopy(s.body) })); }
    if (carouselData.hashtags) { const tags = carouselData.hashtags.match(/#[\wÀ-ɏ]+/g) || []; carouselData.hashtags = tags.slice(0, 4).join(' '); }
    const item = saveGeneratedContent({ id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', type: 'carrossel', mode, profile, feedVariacao, topic: topic || ('Carrossel ' + carouselData.slideCount + ' slides'), caption: caption || carouselData.caption, hashtags: hashtags || carouselData.hashtags, contentMachineType: contentMachineType || null, carouselData, calendarDay: calendarDay || null, calendarMonth: calendarMonth || null, calendarYear: calendarYear || null, imageUrls: [], metodologia: 'rr' });
    res.json({ success: true, contentId: item.id, feedVariacao, ...carouselData });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// Geracao de imagem por slide (GPT Image-1)
// Aceita referenceImageB64 (base64 sem prefixo) para usar a foto real do Google Fotos como base
router.post('/api/image/carousel-slide', async (req, res) => {
  try {
    const { heading, body, slideNumber, totalSlides, funcao, topic, profile, contentId, imagePromptHint, designStyleHint, templateId, quality: rawQuality, referenceImageB64, engine, skipImage } = req.body;
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
    // Estilo do overlay de texto: vem do template Canva casado (aparência real
    // das coleções da Ana). Sem template, cai no fallback editorial que usa as
    // cores reais da identidade da marca (creme/terracota) em vez de um
    // gradiente escuro genérico.
    const fallbackOverlayTokens = { bg: brand.bgLight || '#F1F1EC', accent: brand.accent || '#B32616', text: brand.textOnLight || '#242321', kicker: 'ana moutinho' };
    const overlayStyle  = matchedTemplate?.overlayStyle  || 'lista';
    let overlayTokens = matchedTemplate?.overlayTokens || fallbackOverlayTokens;
    // Duas variações da MESMA identidade. A capa é o que aparece no grid, por
    // isso é ela que muda de fundo — o miolo mantém a linguagem em ambas.
    const ehCapa = (funcao === 'CAPA') || Number(slideNumber) === 1;
    if (req.body.feedVariacao === 'B') {
      overlayTokens = ehCapa
        ? { ...overlayTokens, bg: brand.accent, headline: brand.bgBrand, text: brand.bgBrand, accent: brand.bgBrand, papelSelo: brand.bgBrand }
        : { ...overlayTokens, bg: brand.bgMid };
    }
    const designMeta = { heading: heading||'', body: body||'', accent: brand.accent||'#C8A020', bgDark: brand.bgDark||'#0A0A0A', bgLight: brand.bgLight||'#F5F4F0', handle: brand.handle||account.handle, overlayStyle, overlayTokens, slideNumber, totalSlides, funcao: funcao||(slideNumber===1?'CAPA':slideNumber===totalSlides?'ASSINATURA':'CONTEUDO'), templateId: matchedTemplate?.id || null, templateName: matchedTemplate?.name || null };

    // A utilizadora anexou a própria imagem para este slide: devolvemos só o
    // designMeta (template casado, estilo, tokens) e poupamos a geração.
    if (skipImage) return res.json({ success: true, b64: null, url: null, designMeta, quality: 'propria' });

    let imageData;

    if (referenceImageB64) {
      // Usa a foto real como imagem de entrada via edits endpoint
      const imgBuffer = Buffer.from(referenceImageB64, 'base64');
      const { FormData: NodeFormData, Blob: NodeBlob } = await import('node:buffer').catch(() => ({}));
      const FormDataLib = (typeof FormData !== 'undefined') ? FormData : (await import('formdata-node').catch(() => null))?.FormData;
      const form = new (FormDataLib || FormData)();
      form.append('model', IMAGE_MODEL);
      form.append('prompt', promptPhoto + ' Keep the person/subject from the reference photo as the main element. Apply the brand editorial style on top.');
      form.append('n', '1');
      form.append('size', '1024x1536');
      form.append('quality', quality);
      // Envia a imagem como ficheiro PNG
      const blob = new Blob([imgBuffer], { type: 'image/png' });
      form.append('image', blob, 'photo.png');
      const r = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + requireOpenAIKey() },
        body: form,
      });
      const data = await r.json();
      if (data.error) {
        console.warn('[carousel-slide] edits falhou, fallback para generations:', data.error.message);
        // Fallback: gera normalmente sem a foto
        const img = await generateImage({ prompt: promptPhoto, size: '1024x1536', quality });
        imageData = { b64_json: img.b64, url: img.url };
      } else {
        imageData = data.data?.[0];
      }
    } else {
      const img = await generateImage({ prompt: promptPhoto, size: '1024x1536', quality });
      imageData = { b64_json: img.b64, url: img.url };
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
