// ── Image crop: 2:3 → 4:5 for Instagram feed ─────────────────────────────
// GPT-Image-1 only generates 1024×1536 (2:3). Instagram feed is 4:5 (1080×1350).
// Center-crop removes 128px from top and bottom (8.3% each side) — safe because
// all prompts instruct the model to keep content within the inner 80% safe zone.
async function cropTo45(b64png) {
  try {
    const sharp = require('sharp');
    const inputBuf = Buffer.from(b64png, 'base64');
    // 1024×1536 → center crop to 1024×1280 (4:5) → resize to 1080×1350
    const cropHeight = Math.round(1024 * 5 / 4); // 1280
    const topOffset  = Math.round((1536 - cropHeight) / 2); // 128
    const outputBuf = await sharp(inputBuf)
      .extract({ left: 0, top: topOffset, width: 1024, height: cropHeight })
      .resize(1080, 1350, { fit: 'fill', kernel: 'lanczos3' })
      .png({ compressionLevel: 8 })
      .toBuffer();
    return outputBuf.toString('base64');
  } catch (e) {
    console.warn('[cropTo45] sharp não disponível, retornando original:', e.message);
    return b64png;
  }
}

// ── Prompt builder for carousel slide images ──────────────────────────────
// Layout-first approach: prompts describe GRAPHIC DESIGN structures, not art.
// This matches the quality standard of professional brand identity carousel mockups.
function buildCarouselPrompt({ quality, brand = {}, aestheticOverride, slideRole, heading, body, slideNumber, totalSlides, sceneHint }) {
  const isFirst = slideNumber === 1 || slideRole === 'CAPA';
  const isLast  = slideNumber === totalSlides || slideRole === 'CTA' || slideRole === 'ASSINATURA';
  const aestheticDNA = aestheticOverride || brand.aestheticDNA || 'premium editorial minimalist design';
  const brandName    = brand.name    || 'MARCA';
  const brandHandle  = brand.handle  || '';

  // ── Layout structure per slide role ──────────────────────────────────────
  let layoutStructure;
  if (isFirst) {
    layoutStructure = `VISUAL DA CAPA (FUNDO/BACKGROUND APENAS — SEM TEXTO):
— Composição fotográfica ou ilustrativa que evoca o tema: "${sceneHint || heading || ''}"
— Fundo rico com textura, profundidade e luz dramática nas cores da paleta da marca
— Elemento gráfico ou forma geométrica da marca como detalhe sutil no canto ou fundo
— Atmosfera premium, editorial, cinematográfica — como capa de revista de negócios
— IMPORTANTE: ZERO texto, zero tipografia, zero letras na imagem`;
  } else if (isLast) {
    layoutStructure = `VISUAL DE ENCERRAMENTO (FUNDO/BACKGROUND APENAS — SEM TEXTO):
— Composição clean e elegante nas cores da marca, sensação de fechamento e ação
— Fundo com gradiente suave ou textura sutil — pode ter uma forma geométrica ou símbolo da marca
— Tom convidativo, caloroso, profissional
— IMPORTANTE: ZERO texto, zero tipografia, zero letras na imagem`;
  } else {
    layoutStructure = `VISUAL DE CONTEÚDO — slide ${slideNumber} de ${totalSlides} (FUNDO/BACKGROUND APENAS — SEM TEXTO):
— Imagem temática que ilustra visualmente o conceito: "${sceneHint || heading || ''}"
— Fundo consistente com os outros slides em paleta de cores e mood
— Pode ser fotografia editorial, textura, forma abstrata ou composição geométrica
— Elemento sutil da identidade visual da marca (cor de acento, forma, detalhe)
— IMPORTANTE: ZERO texto, zero tipografia, zero letras na imagem`;
  }

  // ── Execution requirements ────────────────────────────────────────────────
  const execution = [
    `ESTE É UM VISUAL DE FUNDO (BACKGROUND) para um slide de carrossel Instagram. NÃO É uma peça gráfica com texto. O texto será adicionado por cima via CSS/HTML — NÃO inclua texto, título, legenda, hashtag, handle ou qualquer tipografia na imagem.`,
    `Qualidade visual: fotografia editorial premium ou ilustração de marca publicável. Atmosfera coerente com a identidade da marca.`,
    `Cores: estritamente da paleta da marca. Zero improvisação cromática.`,
    `Textura e profundidade: iluminação cinematográfica, sombras difusas, profundidade de campo — nunca fundo completamente liso.`,
    `Consistência de série: este background deve pertencer visivelmente ao mesmo universo visual dos outros slides.`,
    `Formato: 1024×1536px. Composição centralizada e equilibrada, funciona bem cortado para 4:5. Sem watermarks, logotipos externos ou elementos de UI.`,
    `REGRA ABSOLUTA: ZERO texto visível na imagem. Nenhuma letra, número, palavra, símbolo tipográfico. Só visual puro.`,
  ].map(l => `— ${l}`).join('\n');

  return [
    `Crie um VISUAL DE FUNDO (background image) para o slide ${slideNumber} de ${totalSlides} de um carrossel Instagram.`,
    `É uma imagem de fundo pura — sem texto, sem tipografia, sem legendas. O texto será sobreposto por CSS.`,
    '',
    `════ SISTEMA DE DESIGN E IDENTIDADE VISUAL DA MARCA ════`,
    aestheticDNA,
    '',
    `════ ESTRUTURA E LAYOUT DESTE SLIDE ════`,
    layoutStructure,
    sceneHint ? `\nCONTEXTO TEMÁTICO ADICIONAL: ${sceneHint}` : '',
    '',
    `════ REQUISITOS DE EXECUÇÃO ════`,
    execution,
  ].filter(Boolean).join('\n');
}

function normalizeSlidesFromGPT(parsed, fallbackTema) {
  let rawSlides = parsed.slides || parsed.blocos || parsed.cards || parsed.content || [];
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
    for (const key of Object.keys(parsed)) { if (Array.isArray(parsed[key]) && parsed[key].length > 2) { rawSlides = parsed[key]; break; } }
  }
  return rawSlides.map((s, idx) => {
    const num = s.slide || s.slideNumber || s.numero || (idx + 1);
    let textos = [];
    if (Array.isArray(s.textos) && s.textos.length > 0) { textos = s.textos; }
    else if (Array.isArray(s.texts) && s.texts.length > 0) { textos = s.texts.map(t => ({ tipo: t.type||t.tipo||'texto', texto: typeof t==='string'?t:(t.text||t.texto||'') })); }
    else { const heading = s.heading||s.titulo||s.title||s.hook||s.gancho||s.texto||''; const body = s.body||s.corpo||s.content||s.conteudo||s.subtitulo||''; if (heading) textos.push({ posicao:1, tipo:'hook', texto:heading }); if (body) textos.push({ posicao:2, tipo:'paragrafo', texto:body }); }
    if (textos.length === 0) textos.push({ posicao:1, tipo:'texto', texto:'Slide '+num });
    return { slideNumber: Number(num), funcao: s.funcao||s.label||s.role||(idx===0?'CAPA':idx===rawSlides.length-1?'CTA':'DESENVOLVIMENTO'), heading: textos[0]?.texto||'', body: textos[1]?.texto||'', textos };
  });
}

module.exports = { cropTo45, buildCarouselPrompt, normalizeSlidesFromGPT };
