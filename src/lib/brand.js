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
    aestheticDNA:`IDENTIDADE: "Ana mais real" — diário visual de quem está dentro da operação: marketing, negócios e decisões para quem está construindo uma empresa de verdade. Não é influencer nem palestrante. É quem vive o problema junto com o empresário.

CONCEITO VISUAL: editorial humano e inteligente — feito por uma pessoa, não por um departamento de branding. Como as páginas de um livro bonito encontradas com a estética de um feed de fotógrafo documental europeu. Sofisticação sem ostentação. Profundidade sem heaviness.

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

TOM VISUAL: editorial · humano · espontâneo · inteligente · brasileiro · arejado · granulado · creme · direto

FEITO POR PESSOA, NÃO POR DEPARTAMENTO DE BRANDING:
— O post não pode parecer apresentação corporativa nem portfólio de agência premium: perfeição excessiva, grids impecáveis, mockups e elementos 3D transmitem distância
— Preferir: fotos reais (reunião, mesa de trabalho, caderno, tela do computador), prints, anotações, escrita à mão pontual, textura visível
— Tipografia com personalidade e texto grande — frase que parece escrita para uma pessoa específica
— A sensação a transmitir é "eu sei exatamente o que você está vivendo", não "olha como minha marca é sofisticada"

PROIBIDO ABSOLUTAMENTE: fundos escuros, preto, neon, gradientes coloridos, elementos decorativos infantis, estética de coach, LinkedIn, motivacional, citações com fontes script floreadas, fotos de banco de imagens com sorriso forçado, emojis gráficos.`,
    copyDNA:`COPY PARA ANA MOUTINHO
PÚBLICO: dono de negócio que já vende e agora precisa fazer a empresa crescer sem carregar tudo sozinho. Nunca falar com quem "quer abrir um negócio".
IDEIA CENTRAL DA MARCA: como construir empresas maiores sem construir uma vida menor.
1. HOOK: afirmacao que nomeia algo que o empresario vive mas ainda nao formulou. Situacao concreta da operacao (equipe, leads, margem, decisao, delegacao), nunca conceito abstrato.
2. TOM: adulto, direto, especifico. De par para par com quem tem CNPJ. Opiniao assumida com raciocinio a vista. Provocativo quando precisa. Nunca motivacional, nunca palestrante, nunca de cima.
3. ESTRUTURA: gancho -> situacao real ou bastidor -> tensao (o que quase ninguem diz em voz alta) -> tese clara -> CTA que convida a reconhecer-se, nao a aplaudir.
4. TERRITORIOS: marketing que gera negocio (aquisicao, oferta, posicionamento, conversao, CAC, LTV, funil, retencao, atendimento); decisoes empresariais (quando investir mais, quando contratar agencia, quando o problema e processo e nao pessoa, faturamento subindo com margem caindo, segunda unidade); o dono como gargalo (delegacao, equipe, processo, dependencia do fundador); bastidores reais (reunioes, analises, erros, opinioes que mudaram, bastidores da Case); dores que ninguem fala (solidao, medo, insegurança, comparacao, exaustao, culpa, medo de crescer errado); visao de mundo (trabalho, dinheiro, ambicao, lideranca, tecnologia, IA, cultura empresarial).
5. PROIBIDO: desbloqueie, proximo nivel, segredo, formula, mindset, escale seu negocio, faturar 6 digitos, qualquer tom de guru ou coach, dica solta sem consequencia, metrica de vaidade.
6. TENSOES REAIS QUE CONECTAM: "se eu parar, muita coisa para"; "fatura bem mas nao sinto segurança"; "nao sei se o problema e o marketing, a equipe, a oferta ou eu"; "ja fui enganado por prestador"; "cresci e o caos cresceu junto"; "criei um negocio para ter liberdade e criei um trabalho que me persegue".
7. REGUA (5 SIM obrigatorios): fala com quem ja tem negocio? ele se reconhece numa situacao concreta? existe tensao real? diz algo que ele precisava ouvir mas nao sabia formular? reforca a visao da Ana sobre negocios?`,
  },
};

module.exports = { BRAND_IDENTITIES, ACCOUNTS, getAccount, getManualText };
