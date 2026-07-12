const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { CANVA_TEMPLATES_FILE } = require('../config');

// ═══════════════════════════════════════════════════════════════════════════
// CANVA TEMPLATES
// Cada template pode ter:
//   aesthetic  — descrição curta (1 linha) usada em listagens e no matcher
//   visualDNA  — descrição visual profunda (paleta, tipografia, layout, mood)
//                injetada diretamente no prompt de geração de imagem.
//                Quando presente, tem prioridade sobre `aesthetic`.
// ═══════════════════════════════════════════════════════════════════════════

// DNA visual base dos carrosséis de referência da Ana (Canva).
// Placeholder derivado da identidade da marca — substituir pela descrição
// absorvida dos designs reais assim que forem exportados/partilhados.
const ANA_CARROSSEL_DNA = `ESTILO DO TEMPLATE (carrossel de referência da Ana Moutinho):
— Fundo off-white creme dominante (#FAF8F5), textura de papel fine art sutil
— Tipografia serifada editorial em marrom escuro quente (#2C2420), frases grandes com muito respiro
— Detalhes finos em marrom café (#8B7355): linhas divisórias, molduras de borda fina, pequenos sublinhados
— Acento pontual em terracota queimado (#C17B6F) apenas em micro-detalhes
— Composição assimétrica elegante, muito espaço vazio intencional, sensação de página de livro
— Fotografia (quando presente) com luz natural difusa e grain analógico leve
— Zero elementos decorativos, zero ícones, zero estética de coach`;

const DEFAULT_CANVA_TEMPLATES = [
  { id: 'tmpl_ana_carrossel_001', createdAt: '2026-07-12T00:00:00.000Z', name: 'Carrossel Ana — Referência 1', contentTypes: ['carrossel'], aesthetic: 'Carrossel editorial creme, serifada, minimalista intimista (referência 1)', visualDNA: ANA_CARROSSEL_DNA, slideCount: 10, canvaUrl: 'https://www.canva.com/design/DAHOYMschTo/7-wmTI9UhBd_fS6CmNPgjw/edit', profile: 'pessoal' },
  { id: 'tmpl_ana_carrossel_002', createdAt: '2026-07-12T00:00:00.000Z', name: 'Carrossel Ana — Referência 2', contentTypes: ['carrossel'], aesthetic: 'Carrossel editorial creme, serifada, minimalista intimista (referência 2)', visualDNA: ANA_CARROSSEL_DNA, slideCount: 10, canvaUrl: 'https://www.canva.com/design/DAHOYBvMcGQ/gyafs_lB36VerRbIBEBbFw/edit', profile: 'pessoal' },
  { id: 'tmpl_ana_carrossel_003', createdAt: '2026-07-12T00:00:00.000Z', name: 'Carrossel Ana — Referência 3', contentTypes: ['carrossel'], aesthetic: 'Carrossel editorial creme, serifada, minimalista intimista (referência 3)', visualDNA: ANA_CARROSSEL_DNA, slideCount: 10, canvaUrl: 'https://www.canva.com/design/DAHOYK2q-Y0/DmZTpOUXjL2OHsSYSLG-bQ/edit', profile: 'pessoal' },
  { id: 'tmpl_default_001', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Estáticos - Chamada em Destaque [Handwriting]', contentTypes: ['frase'], aesthetic: 'Handwriting, chamada de atenção em destaque, estilo manuscrito', slideCount: 1, canvaUrl: 'https://www.canva.com/design/DAHL5Modgyc/vEEcxRj9jnHi4dFKqSm_pA/edit', profile: 'all' },
  { id: 'tmpl_default_002', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Estáticos [Sublime]', contentTypes: ['frase'], aesthetic: 'Elegante, minimalista, identidade visual sóbria', slideCount: 1, canvaUrl: 'https://www.canva.com/design/DAHL5R5kU2Y/xIyRwYXAdmFCqKaYiw3dYA/edit', profile: 'all' },
  { id: 'tmpl_default_003', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel - Recomendações', contentTypes: ['carrossel', 'lista'], aesthetic: 'Carrossel de indicações e recomendações', slideCount: 178, canvaUrl: 'https://www.canva.com/design/DAHL5TqhKyI/etk6efSME5DhFwZ4hgdDuw/edit', profile: 'all' },
  { id: 'tmpl_default_004', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel [Flow]', contentTypes: ['carrossel'], aesthetic: 'Estilo Flow, fluido e moderno', slideCount: 47, canvaUrl: 'https://www.canva.com/design/DAHMlM5WCeE/NRbPJN3Jh8i3pp0ZeFENA/edit', profile: 'all' },
  { id: 'tmpl_default_005', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel [StudioMoulin]', contentTypes: ['carrossel'], aesthetic: 'Estilo StudioMoulin, editorial sofisticado', slideCount: 67, canvaUrl: 'https://www.canva.com/design/DAHMlGdvovg/OKFiMiynrALoa53TnTlrnQ/edit', profile: 'all' },
  { id: 'tmpl_default_006', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Sobre Mim [Lifestyle]', contentTypes: ['bastidores', 'dump'], aesthetic: 'Lifestyle, conteúdo pessoal, autêntico e íntimo', slideCount: 86, canvaUrl: 'https://www.canva.com/design/DAHL5N_tvhA/7MZi0VRLPp3QdXBEklwYVw/edit', profile: 'all' },
  { id: 'tmpl_default_007', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Variados [Flow]', contentTypes: ['carrossel', 'frase'], aesthetic: 'Estilo Flow, versátil e dinâmico', slideCount: 18, canvaUrl: 'https://www.canva.com/design/DAHMlDU5T9U/edit', profile: 'all' },
  { id: 'tmpl_default_008', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post para Frase [StudioMoulin]', contentTypes: ['frase'], aesthetic: 'Estilo StudioMoulin, elegante para frases e citações', slideCount: 22, canvaUrl: 'https://www.canva.com/design/DAHMlPnisuI/E7t-QxVHNLMOSxIAQ6oMiw/edit', profile: 'all' },
  { id: 'tmpl_default_009', createdAt: '2026-06-14T00:00:00.000Z', name: 'Capa para Photodump', contentTypes: ['dump'], aesthetic: 'Capa criativa para posts estilo photodump', slideCount: 87, canvaUrl: 'https://www.canva.com/design/DAHL5RVJ-ug/o_RsgOzgY8HsDubf1vnAOQ/edit', profile: 'all' }
];

function loadCT() {
  try {
    if (!fs.existsSync(CANVA_TEMPLATES_FILE)) {
      fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2));
      return DEFAULT_CANVA_TEMPLATES;
    }
    const data = JSON.parse(fs.readFileSync(CANVA_TEMPLATES_FILE, 'utf8'));
    if (!data.length) { fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2)); return DEFAULT_CANVA_TEMPLATES; }
    // Garante que templates default novos aparecem mesmo com ficheiro já existente
    const missing = DEFAULT_CANVA_TEMPLATES.filter(d => !data.some(t => t.id === d.id));
    if (missing.length) { const merged = [...missing, ...data]; saveCT(merged); return merged; }
    return data;
  } catch(e) { return DEFAULT_CANVA_TEMPLATES; }
}
function saveCT(t) { try { fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(t, null, 2)); } catch(e) {} }

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-MATCH: escolhe o template que melhor encaixa no conteúdo
// Usado automaticamente na geração de imagens de carrossel.
// Cache em memória por carrossel (contentId) para não chamar a IA por slide.
// ═══════════════════════════════════════════════════════════════════════════

const MATCH_TTL = 30 * 60 * 1000;
const matchCache = {};

function templateStyle(t) { return t.visualDNA || t.aesthetic || ''; }

async function matchBestTemplate({ tipo = 'carrossel', tema = '', slides = [], profile = 'pessoal', cacheKey = null }) {
  const key = cacheKey || [profile, tipo, tema].join('|').slice(0, 200);
  const hit = matchCache[key];
  if (hit && Date.now() - hit.at < MATCH_TTL) return hit.template;

  const candidates = loadCT().filter(t =>
    (!t.profile || t.profile === profile || t.profile === 'all') &&
    templateStyle(t) &&
    (!tipo || !Array.isArray(t.contentTypes) || !t.contentTypes.length || t.contentTypes.includes(tipo))
  );
  if (!candidates.length) return null;
  if (candidates.length === 1 || !process.env.ANTHROPIC_API_KEY) {
    matchCache[key] = { at: Date.now(), template: candidates[0] };
    return candidates[0];
  }

  try {
    const list = candidates.map((t, i) => `${i + 1}. ID: ${t.id}\n   Nome: ${t.name}\n   Tipos: ${Array.isArray(t.contentTypes) ? t.contentTypes.join(', ') : 'geral'}\n   Estética: ${(t.aesthetic || '').slice(0, 200)}`).join('\n\n');
    const slidesResumo = Array.isArray(slides) ? slides.slice(0, 3).map((s, i) => `  Slide ${i + 1}: "${(s.heading || s.textos?.[0]?.texto || '').slice(0, 60)}"`).join('\n') : '';
    const prompt = `Tipo de conteúdo: ${tipo}\nTema: ${tema}\n${slidesResumo ? 'Slides:\n' + slidesResumo + '\n' : ''}\nTemplates disponíveis:\n${list}\n\nEscolhe O template cuja estética melhor encaixa neste conteúdo específico. Responde APENAS JSON: {"templateId":"tmpl_xxx","reason":"1 frase"}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const jm = d.content[0].text.trim().match(/\{[\s\S]*\}/);
    const parsed = jm ? JSON.parse(jm[0]) : null;
    const best = candidates.find(t => t.id === parsed?.templateId) || candidates[0];
    matchCache[key] = { at: Date.now(), template: best };
    return best;
  } catch (e) {
    console.warn('[canva] matchBestTemplate falhou, usando primeiro candidato:', e.message);
    matchCache[key] = { at: Date.now(), template: candidates[0] };
    return candidates[0];
  }
}

module.exports = { loadCT, saveCT, DEFAULT_CANVA_TEMPLATES, matchBestTemplate, templateStyle };
