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
    // Design system Editorial Scrapbook: 70-80% papel, 10-20% vermelho
    // editorial (assinatura), 5-10% apoio (rosa fita, azul fita, amarelo).
    accent:'#A92E1D',accentAlt:'#7F2117',accentFem:'#E8B7B0',bgDark:'#7F2117',bgLight:'#F3F0E8',
    bgMid:'#EAE6DC',bgBrand:'#F8F7F2',textOnDark:'#F8F7F2',textOnLight:'#292725',
    salvia:'#7C8A6E',tinta:'#292725',cinza:'#77736C',amarelo:'#E6C84F',azulFita:'#AFC4D1',
    handle:'@analuisa.moutinho',name:'Ana Moutinho',
    aestheticDNA:`IDENTIDADE: editorial-scrapbook — revista independente + caderno de referências + arquivo de copywriting. A sensação final: "alguém muito inteligente reuniu referências, fez anotações e transformou aquilo numa publicação" — nunca "uma agência criou um carrossel bonito".

CONCEITO VISUAL: página de publicação independente sobre papel. Colagem analógica, anotação à mão, material colecionável. Palavras-chave: editorial, scrapbook, analog, independent magazine, copywriting notebook, creative archive, paper texture, collage, handwritten annotations.

PALETA CROMÁTICA OBRIGATÓRIA (regra 70-80% papel · 10-20% vermelho · 5-10% apoio):
— Fundo dominante: papel off-white #F3F0E8 e papel secundário #EAE6DC — SEMPRE com textura de papel reciclado, grain fotográfico sutil e pequenas irregularidades; nunca fundo liso digital
— Cor de assinatura: vermelho editorial #A92E1D e vermelho escuro #7F2117
— Texto: preto suave #292725 e cinza manuscrito #77736C; branco papel #F8F7F2
— Apoio ocasional (5-10% no máximo): amarelo marca-texto #E6C84F, rosa fita #E8B7B0, azul fita #AFC4D1
— NUNCA: neon, gradiente forte, combinação saturada

FOTOGRAFIA (a foto entra como RECORTE colado na composição, nunca fundo full-bleed):
— flash direto, granulação, enquadramento imperfeito, tom documental
— objetos cotidianos, mesa de trabalho, caderno anotado, print de campanha, screenshot, material de arquivo
— levemente dessaturada, contraste moderado, temperatura levemente quente
— NUNCA banco de imagens corporativo, nunca sorriso posado

COMPOSIÇÃO: assimétrica e propositalmente imperfeita — blocos deslocados, sobreposição, elementos cortados pela margem, imagens inclinadas, MUITO espaço negativo. O conteúdo deve parecer montado, não diagramado. Sombras suaves e difusas ("várias folhas sobre uma mesa"). Bordas finas 1px em cinza/preto de baixa intensidade.

VOCABULÁRIO GRÁFICO: fita adesiva translúcida (rosa, azul, bege, amarela), setas finas desenhadas à mão, círculos imperfeitos à volta de palavras, sublinhado manual, rabiscos pontuais, selos de arquivo ("CASE STUDY", "OBSERVAÇÃO", "NÃO PULE"), papel rasgado, recortes sobrepostos, microtexto de classificação ("NOTA #03", "ARQUIVO 004").

RITMO: cada slide é uma página diferente da mesma publicação — alterna impacto (uma frase enorme), aprofundamento (texto + imagem + anotação), referência (print/documento) e respiro (área vazia + uma frase). Consistência de paleta e textura, variação de composição.

PROIBIDO ABSOLUTAMENTE: gradiente moderno, glassmorphism, 3D corporativo, ícones genéricos, emojis, cards arredondados demais, excesso de sombras, fundo totalmente liso, tipografia futurista, mockup tecnológico, simetria perfeita em todos os slides, aparência de PowerPoint ou template de Canva.`,
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
