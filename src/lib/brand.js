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
    // Paleta: terracota (marca) · vinho (impacto) · sálvia (variação)
    // sobre base bege texturizada. Nunca branco frio, nunca saturado.
    accent:'#B33A2B',accentAlt:'#8E2A20',accentFem:'#F3C9B6',bgDark:'#5C1620',bgLight:'#EFEBE1',
    bgMid:'#E5DDCD',bgBrand:'#F7F3EA',textOnDark:'#F7F3EA',textOnLight:'#1F1B17',
    salvia:'#7C8A6E',tinta:'#1F1B17',
    handle:'@analuisa.moutinho',name:'Ana Moutinho',
    aestheticDNA:`IDENTIDADE: editorial-vintage brasileiro — moodboard de quem trabalha com marketing e pensa negócio. Papel, recorte, fita adesiva, anotação à mão. Feito por uma pessoa, não por um departamento de branding.

CONCEITO VISUAL: colagem editorial sobre papel. Como a mesa de trabalho de alguém que recorta anúncios, cola referências e escreve observações à mão na margem. Inteligente e caloroso — nunca corporativo, nunca minimalismo frio de agência.

PALETA CROMÁTICA OBRIGATÓRIA:
— Base dominante: bege papel #EFEBE1 e kraft #E5DDCD (60-75% da composição) — SEMPRE com textura de papel visível, nunca branco chapado nem cinza frio
— Cor de marca: vermelho-terracota/tijolo #B33A2B — títulos, acentos, elementos desenhados à mão
— Vermelho profundo: vinho #5C1620 — só para peças de mais peso emocional (post estático, abertura)
— Segunda cor: verde-sálvia/oliva #7C8A6E — alternativa ao vermelho, mesma sensação de calor e sofisticação
— Realce: salmão claro #F3C9B6 — marca-texto e fitas adesivas
— Texto e contraste máximo: quase-preto quente #1F1B17
— NUNCA: vermelho saturado vivo como cor dominante, azul-céu vibrante, neon, branco clínico, cinza corporativo, gradiente colorido artificial

TEXTURA E MATERIALIDADE (essencial, não decorativo):
— Papel com grão visível em toda a composição — bege, kraft, papel de carta
— Recortes com borda de fita adesiva translúcida (lisa, xadrez ou washi) presos em ângulo leve
— Fotos como polaroid: moldura branca grossa, leve rotação, sombra suave projetada
— Elementos desenhados à mão em terracota: círculos à volta de palavras, setas curvas, sublinhados, asteriscos
— Sombra sempre suave e quente — nunca sombra dura ou brilho digital

FOTOGRAFIA:
— Luz natural quente, grain analógico, cenas reais de trabalho: mesa, caderno com anotação, tela de computador, print de campanha, reunião, café ao lado do teclado
— Pessoas parciais ou anónimas — mãos, costas, silhueta. Nunca sorriso posado de banco de imagens
— A foto entra como RECORTE colado na composição, não como fundo full-bleed que ocupa tudo

DIREÇÃO DE COMPOSIÇÃO:
— Assimetria de moodboard: recorte num canto, texto grande noutro, anotação à mão ligando os dois
— Muito espaço de papel respirando — a composição não preenche tudo
— Hierarquia clara: uma ideia por peça

SENSAÇÃO: alguém inteligente mostrando o que descobriu, com o material espalhado na mesa. Autoridade sem distância. Caloroso, direto, brasileiro.

TOM VISUAL: editorial · colagem · papel · terracota · anotado à mão · analógico · quente · inteligente

PROIBIDO ABSOLUTAMENTE: fundo branco puro ou cinza frio, cores saturadas vibrantes dominando a peça, mockup 3D, elementos corporativos, ícones genéricos de banco, gradiente colorido artificial, estética de coach ou LinkedIn, brilho digital, sombra dura.`,
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
