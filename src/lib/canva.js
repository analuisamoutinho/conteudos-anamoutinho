const fs = require('fs');
const { CANVA_TEMPLATES_FILE } = require('../config');
const { askOpenAI, MODEL_FAST } = require('./ai');

// ═══════════════════════════════════════════════════════════════════════════
// CANVA TEMPLATES
// Cada template pode ter:
//   aesthetic  — descrição curta (1 linha) usada em listagens e no matcher
//   visualDNA  — descrição visual profunda (paleta, tipografia, layout, mood)
//                injetada diretamente no prompt de geração de imagem.
//                Quando presente, tem prioridade sobre `aesthetic`.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIDADE v2 — editorial-vintage: terracota sobre papel bege, colagem
// Derivada das referências aprovadas pela Ana (moodboard/scrapbook editorial,
// recorte com fita adesiva, anotação à mão, serifada + sans + manuscrita).
// ═══════════════════════════════════════════════════════════════════════════

const IDENTIDADE = 'v2-editorial-vintage';

const PAPEL_BASE = `BASE MATERIAL (comum a toda a identidade da Ana):
— Fundo de papel bege #F3F0E8 ou kraft #EAE6DC com grão visível — nunca branco puro nem cinza frio
— Composição de moodboard: recortes colados com fita adesiva translúcida em ângulo leve
— Fotos entram como polaroid — moldura branca grossa, leve rotação, sombra quente suave
— Acentos desenhados à mão em terracota #A92E1D: círculo à volta de uma palavra, seta curva, sublinhado
— Fotografia de trabalho real em luz natural quente com grain analógico: mesa, caderno anotado, tela do computador, print de campanha, café ao lado do teclado; pessoas sempre parciais ou anónimas
— PROIBIDO: cor saturada vibrante dominando a peça, mockup 3D, brilho digital, sombra dura, estética corporativa ou de coach`;

const DEFAULT_CANVA_TEMPLATES = [
  {
    id: 'tmpl_v2_capa', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Capa — Moodboard Terracota',
    contentTypes: ['cultural', 'tese', 'autoral', 'oferta'],
    aesthetic: 'Papel bege texturizado + título serifado terracota com marca-texto salmão + recorte colado com fita — abertura de carrossel',
    visualDNA: `${PAPEL_BASE}

ESTILO DESTE TEMPLATE (Capa Moodboard — abertura de carrossel):
— Fundo de papel bege ocupando quase tudo; UM recorte fotográfico colado no canto superior, em ângulo, com fita adesiva
— O título entra por overlay em serifada editorial terracota, grande, ocupando o terço inferior — a metade de baixo do fundo deve ficar limpa
— Sensação: alguém abriu a pasta de referências na mesa e começou a explicar`,
    overlayStyle: 'capa', overlayTokens: { bg: '#F3F0E8', text: '#A92E1D', realce: '#E8B7B0', hand: '#292725' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_cartao', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Cartão Terracota — Frase de Impacto',
    contentTypes: ['autoral', 'frase'],
    aesthetic: 'Bloco sólido terracota sobre papel + frase serifada creme — para hooks, verdades e citações',
    visualDNA: `ESTILO DESTE TEMPLATE (Cartão Sólido — citação/hook isolado):
— Bloco de cor sólida terracota #A92E1D (ou vinho #7F2117) ocupando quase todo o slide, com margem de papel bege à volta
— Textura sutil de papel dentro do bloco; SEM fotografia
— A frase entra por overlay em serifada editorial creme, grande e centrada verticalmente
— Sensação: um cartão impresso colado na página`,
    overlayStyle: 'cartao', overlayTokens: { bg: '#A92E1D', text: '#F8F7F2' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_cartao_vinho', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Cartão Vinho — Peso Emocional',
    contentTypes: ['autoral', 'frase'],
    aesthetic: 'Bloco sólido vinho profundo + frase serifada creme — para as dores que ninguém fala',
    visualDNA: `ESTILO DESTE TEMPLATE (Cartão Vinho — conteúdo de mais peso emocional):
— Igual ao Cartão Terracota, mas em vinho profundo #7F2117 — reservado para solidão, medo, exaustão, decisões difíceis
— SEM fotografia; textura de papel subtil dentro do bloco
— Sensação: baixar o tom de voz`,
    overlayStyle: 'cartao', overlayTokens: { bg: '#7F2117', text: '#F8F7F2' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_lista', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Lista Editorial — Kicker + Serifada',
    contentTypes: ['cultural', 'tese', 'autoral', 'oferta'],
    aesthetic: 'Papel bege + kicker fixo em caixa-alta + título serifado com palavra em terracota + exemplo visual colado',
    visualDNA: `${PAPEL_BASE}

ESTILO DESTE TEMPLATE (Lista Editorial — telas de conteúdo, tendências, exemplos):
— Layout REPETIDO em todas as telas: rótulo fixo no topo, título, corpo, e um recorte visual centrado na metade inferior
— Fundo de papel bege liso na metade superior (é onde entra o texto) e o recorte fotográfico colado abaixo
— Sensação: página de revista com o mesmo grid tela após tela`,
    overlayStyle: 'lista', overlayTokens: { bg: '#F3F0E8', accent: '#A92E1D', text: '#292725', kicker: 'ana moutinho' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_lista_kraft', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Lista Kraft — Variação Quente',
    contentTypes: ['cultural', 'tese', 'autoral', 'oferta'],
    aesthetic: 'Mesma estrutura da Lista Editorial em papel kraft mais quente — alterna com a versão bege dentro do carrossel',
    visualDNA: `${PAPEL_BASE}

ESTILO DESTE TEMPLATE (Lista Kraft):
— Idêntico à Lista Editorial, em papel kraft #EAE6DC para alternar telas e dar ritmo ao carrossel
— Mantém o mesmo grid: rótulo no topo, título, corpo, recorte abaixo`,
    overlayStyle: 'lista', overlayTokens: { bg: '#EAE6DC', accent: '#7F2117', text: '#292725', kicker: 'ana moutinho' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_lista_salvia', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Lista Sálvia — Variação sem Vermelho',
    contentTypes: ['cultural', 'tese', 'autoral', 'oferta'],
    aesthetic: 'Estrutura de lista com acento verde-sálvia em vez de terracota — para não repetir vermelho em todo post',
    visualDNA: `${PAPEL_BASE}

ESTILO DESTE TEMPLATE (Lista Sálvia):
— Mesma estrutura editorial, mas com os acentos em verde-sálvia/oliva #7C8A6E
— A fotografia deve puxar para verdes naturais quentes: planta na mesa, luz de janela com folhagem, tecido oliva
— Usar quando o carrossel anterior já foi vermelho`,
    overlayStyle: 'lista', overlayTokens: { bg: '#F3F0E8', accent: '#7C8A6E', text: '#292725', kicker: 'ana moutinho' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_nota', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Nota Colada — Recorte + Manuscrita',
    contentTypes: ['cultural', 'tese', 'autoral'],
    aesthetic: 'Recorte com fita adesiva + rótulo em marcador + observação manuscrita — o formato "o ponto disso é"',
    visualDNA: `${PAPEL_BASE}

ESTILO DESTE TEMPLATE (Nota Colada — comentário sobre um exemplo, bastidor, análise):
— UM recorte fotográfico central colado com fita adesiva bem visível, em ângulo
— Papel bege à volta com bastante respiro em cima e em baixo — é onde entram o rótulo em marcador e a anotação manuscrita
— Sensação: alguém colou um print e escreveu ao lado o que achou`,
    overlayStyle: 'nota', overlayTokens: { bg: '#F3F0E8', accent: '#A92E1D', text: '#292725', label: 'o ponto' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_estatico_vinho', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Estático Vinho — Frase Assinada',
    contentTypes: ['frase'],
    aesthetic: 'Gradiente vinho profundo + frase serifada creme com palavra destacada + assinatura no rodapé',
    visualDNA: `ESTILO DESTE TEMPLATE (Post Estático Vinho — o template que a Ana já usa e funciona):
— Fundo em gradiente vinho profundo #7F2117 com variação de luz no canto superior — profundidade, nunca cor chapada
— Textura de papel muito subtil por cima
— SEM fotografia; o protagonismo é da tipografia
— A frase entra por overlay em serifada editorial creme centrada, com uma palavra-chave em tom mais claro
— Sensação: statement calmo e definitivo`,
    overlayStyle: 'estatico', overlayTokens: { bg: '#7F2117', bgTopo: '#A92E1D', text: '#F8F7F2', destaque: '#E8B7B0' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_estatico_foto', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Estático Foto — Luz Natural',
    contentTypes: ['frase'],
    aesthetic: 'Fundo fotográfico com luz natural e sombra de persiana + frase serifada branca + assinatura',
    visualDNA: `ESTILO DESTE TEMPLATE (Post Estático Fotográfico):
— Fotografia full-bleed de cena real com luz natural forte e sombra desenhada (persiana, janela, folhagem) atravessando o enquadramento
— Tons quentes ou verde-oliva/musgo; véu escuro quente por cima para o texto respirar
— Zona central calma — é onde entra a frase
— A frase entra por overlay em serifada editorial branca com uma palavra em tom mais claro
— Sensação: intimista, luz de fim de tarde, pausa`,
    overlayStyle: 'estatico', overlayTokens: { veil: 'rgba(38,30,20,.52)', text: '#F8F7F2', destaque: '#C9D2BC' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_v2_fechamento', createdAt: '2026-08-18T00:00:00.000Z', identidade: IDENTIDADE,
    name: 'Fechamento — Bloco Sólido + CTA',
    contentTypes: ['cultural', 'tese', 'autoral', 'oferta'],
    aesthetic: 'Bloco quase-preto ou terracota + frase serifada + CTA em pill salmão — última tela do carrossel',
    visualDNA: `ESTILO DESTE TEMPLATE (Fechamento de carrossel):
— Fundo de cor sólida quase-preto quente #292725 (ou terracota) com textura de papel muito subtil
— SEM fotografia — contraste máximo para fechar
— A frase de impacto entra em serifada creme e o CTA num botão arredondado salmão
— Sensação: ponto final com convite`,
    overlayStyle: 'fechamento', overlayTokens: { bg: '#292725', text: '#F8F7F2', accent: '#E8B7B0' },
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
];

function loadCT() {
  try {
    if (!fs.existsSync(CANVA_TEMPLATES_FILE)) {
      fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2));
      return DEFAULT_CANVA_TEMPLATES;
    }
    const data = JSON.parse(fs.readFileSync(CANVA_TEMPLATES_FILE, 'utf8'));
    if (!data.length) { fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2)); return DEFAULT_CANVA_TEMPLATES; }
    // Os templates da marca vivem no código: a definição em DEFAULT_CANVA_TEMPLATES
    // sobrepõe o que estiver gravado, senão um deploy antigo mantém a identidade
    // anterior para sempre. Templates criados pelo utilizador (ids que não são
    // default) e templates de identidades antigas são descartados do conjunto ativo.
    const defaultIds = new Set(DEFAULT_CANVA_TEMPLATES.map(d => d.id));
    const custom = data.filter(t => !defaultIds.has(t.id) && !String(t.id).startsWith('tmpl_ana_') && !String(t.id).startsWith('tmpl_default_'));
    const merged = [...DEFAULT_CANVA_TEMPLATES, ...custom];
    if (JSON.stringify(merged) !== JSON.stringify(data)) saveCT(merged);
    return merged;
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

async function matchBestTemplate({ tipo = 'autoral', tema = '', slides = [], profile = 'pessoal', cacheKey = null }) {
  const key = cacheKey || [profile, tipo, tema].join('|').slice(0, 200);
  const hit = matchCache[key];
  if (hit && Date.now() - hit.at < MATCH_TTL) return hit.template;

  const candidates = loadCT().filter(t =>
    (!t.profile || t.profile === profile || t.profile === 'all') &&
    templateStyle(t) &&
    (!tipo || !Array.isArray(t.contentTypes) || !t.contentTypes.length || t.contentTypes.includes(tipo))
  );
  if (!candidates.length) return null;
  if (candidates.length === 1 || !process.env.OPENAI_API_KEY) {
    matchCache[key] = { at: Date.now(), template: candidates[0] };
    return candidates[0];
  }

  try {
    const list = candidates.map((t, i) => `${i + 1}. ID: ${t.id}\n   Nome: ${t.name}\n   Tipos: ${Array.isArray(t.contentTypes) ? t.contentTypes.join(', ') : 'geral'}\n   Estética: ${(t.aesthetic || '').slice(0, 200)}`).join('\n\n');
    const slidesResumo = Array.isArray(slides) ? slides.slice(0, 3).map((s, i) => `  Slide ${i + 1}: "${(s.heading || s.textos?.[0]?.texto || '').slice(0, 60)}"`).join('\n') : '';
    const prompt = `Tipo de conteúdo: ${tipo}\nTema: ${tema}\n${slidesResumo ? 'Slides:\n' + slidesResumo + '\n' : ''}\nTemplates disponíveis:\n${list}\n\nEscolhe O template cuja estética melhor encaixa neste conteúdo específico. Responde APENAS JSON: {"templateId":"tmpl_xxx","reason":"1 frase"}`;
    const text = await askOpenAI({ prompt, model: MODEL_FAST, maxTokens: 300, json: true });
    const jm = text.match(/\{[\s\S]*\}/);
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
