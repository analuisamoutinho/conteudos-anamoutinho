const fs   = require('fs');
const path = require('path');
const { MANUALS_DIR } = require('../config');
const { getProfileManualContext } = require('./profiles');

// ── Accounts ──────────────────────────────────────────────────────────────
const ACCOUNTS = {
  pessoal: { id: process.env.INSTAGRAM_ACCOUNT_ID_PESSOAL, token: process.env.INSTAGRAM_TOKEN_PESSOAL || process.env.INSTAGRAM_ACCESS_TOKEN, name: 'Ana Moutinho',     handle: '@analuisa.moutinho' },
};
function getAccount(profile) { return ACCOUNTS[profile] || ACCOUNTS.pessoal; }

function getManualText(profile) {
  const profileContext = getProfileManualContext(profile);
  const pdfPath = path.join(MANUALS_DIR, `${profile || 'pessoal'}.pdf`);
  const pdfNote = fs.existsSync(pdfPath)
    ? '[Manual PDF do cliente carregado — aplicar diretrizes visuais e de identidade do documento]'
    : '';
  return [profileContext, pdfNote].filter(Boolean).join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIDADES VISUAIS
// ═══════════════════════════════════════════════════════════════════════════
const BRAND_IDENTITIES = {
  pessoal: {
    accent:'#8B7355',accentAlt:'#C4A882',accentFem:'#C17B6F',bgDark:'#3D3530',bgLight:'#FAF8F5',
    bgMid:'#EDEAE4',bgBrand:'#F5F2EE',textOnDark:'#F5F2EE',textOnLight:'#2C2420',
    handle:'@analuisa.moutinho',name:'Ana Moutinho',
    moods:['DIARIO_EDITORIAL','TYPE_CREME','COLAGEM_REAL','FRASE_IMPACTO','HERO_LOFI','DIARIO_EDITORIAL','TYPE_CREME','VIRADA','CTA_INTIMO'],
    aestheticDNA:`IDENTIDADE: "Ana mais real" — diário visual inteligente de alguém construindo a própria vida com intenção, disciplina e profundidade. Não é influencer. É pensadora.

CONCEITO VISUAL: editorial minimalista intimista. Como as páginas de um livro bonito encontradas com a estética de um feed de fotógrafo documental europeu. Sofisticação sem ostentação. Profundidade sem heaviness.

PALETA CROMÁTICA OBRIGATÓRIA:
— Fundo primário dominante: off-white creme #FAF8F5 (ocupa 65-75% da composição) — nunca branco puro, nunca cinza frio
— Fundo secundário: bege claro aconchegante #EDEAE4
— Acento principal: marrom café aquecido #8B7355 — para bordas finas, linhas divisórias, detalhes pontuais
— Acento feminino pontual: rosa queimado terracota #C17B6F — apenas em detalhes muito sutis, como sublinhados ou pequenos elementos gráficos
— Texto principal: marrom escuro quente #2C2420
— Texto secundário: marrom médio #8B7355
— NUNCA: preto puro, fundos escuros, azul, verde, cinza frio, branco clínico

TIPOGRAFIA — REGRAS ABSOLUTAS:
— Títulos: serifada editorial ou sans-serif geométrica leve, peso 300-400 para frases longas ou 700-800 para statements de impacto curtos
— Frases de impacto: letra grande, ocupando boa parte da composição, quase sem margens — editorial, não de blog
— Subtítulos e legendas: sans-serif clean em peso 400, espaçamento generoso
— Nunca fontes decorativas, scripts cursivos exagerados ou tipografias de coach/LinkedIn

ATMOSFERA E LUZ:
— Luz natural difusa, como entrada de janela em dia nublado ou manhã tranquila
— Granulação fotográfica sutil sobre qualquer elemento fotográfico (grain de filme analógico leve)
— Profundidade com sombras muito suaves e translúcidas — nunca sombra dura
— Textura de fundo: papel aquarela, linho fine art, ou papel de algodão — nunca digital liso

ELEMENTOS GRÁFICOS (usar com extrema contenção):
— Linhas finíssimas horizontais em marrom #8B7355 como separadores
— Formas geométricas simples — retângulos de borda fina como enquadramentos
— Manchas de cor muito suaves e translúcidas como elementos de fundo
— NUNCA: ícones decorativos, florinhas, estrelas, ornamentos, stickers, clip art

DIREÇÃO DE COMPOSIÇÃO:
— Layout editorial com respiração ampla — muito espaço vazio intencional
— Regra dos terços para posicionamento do texto principal
— Assimetria elegante — não tudo centralizado (exceto frases de impacto)
— Como a página de um livro do Penguin Classics ou editorial da Vogue Portugal
— Sensação: você está lendo algo que vale a pena ler

SENSAÇÃO E ATMOSFERA:
— Real sem ser crua. Sofisticada sem ser fria. Íntima sem ser vulgar.
— Como um ensaio fotográfico de alguém muito bem-resolvida sendo vista em seu habitat natural
— Transmite: inteligência, intencionalidade, disciplina, profundidade, vida real construída com propósito

TOM VISUAL: editorial · intimista · arejado · granulado · creme · terracota suave · pensativo · direto

PROIBIDO ABSOLUTAMENTE: fundos escuros, preto, neon, gradientes coloridos, elementos decorativos infantis, estética de coach, LinkedIn, motivacional, citações com fontes script floreadas, fotos de banco de imagens com sorriso forçado, emojis gráficos.`,
    copyDNA:`COPY PARA ANA MOUTINHO (Metodologia RR):
IDENTIDADE CENTRAL: Construindo uma vida mais ordenada, virtuosa e significativa, enquanto constroi negocios que crescem de forma solida e sustentavel.
1. HOOK: afirmacao que nomeia algo que a pessoa sente mas nao sabe nomear. Toca em dor ou desejo real ligado a: ordem, virtude, autoaperfeicoamento, corrida, leitura, carater, coerencia.
2. TOM: reflexivo + direto + provocativo. Mistura como fazer com por que fazer com vale a pena fazer.
3. ESTRUTURA: gancho -> historia real ou observacao -> conclusao com tese clara -> CTA intimo.
4. TEMAS PERMITIDOS: planejamento, rotinas, sistemas, metas, disciplina, coragem, prudencia, temperanca, corrida de rua, leitura de livros, virtudes aristotelicas, ordem pessoal, bastidores reais, falhas e aprendizados, construcao de longo prazo, legado, fundacao, constancia.
5. PROIBIDO: desbloqueie, seja sua melhor versao, sucesso, qualquer tom de guru ou coach.
6. CONFLITOS REAIS QUE CONECTAM: perfeccionismo vs acao, excesso de interesses, dificuldade de constancia, querer excelencia sem paralisar.`,
  },
};

module.exports = { BRAND_IDENTITIES, ACCOUNTS, getAccount, getManualText };
