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
    accent:'#B32616',accentAlt:'#811F16',accentFem:'#E8B8B2',bgDark:'#811F16',bgLight:'#F1F1EC',
    bgMid:'#E9E5DA',bgBrand:'#FAF9F4',textOnDark:'#FAF9F4',textOnLight:'#242321',
    salvia:'#7C8A6E',tinta:'#242321',cinza:'#67645F',amarelo:'#E3C44A',azulFita:'#AFC6D3',
    handle:'@analuisa.moutinho',name:'Ana Moutinho',
    aestheticDNA:`IDENTIDADE: publicação editorial independente, gráfica, densa e espirituosa, construída a partir de evidências, recortes, referências e anotações. A sensação: "alguém pesquisou, selecionou, imprimiu, marcou e transformou o material numa pequena publicação autoral" — NUNCA "uma marca pessoal elegante criou um carrossel bege".

REGRA CENTRAL: isto é um scrapbook DE EVIDÊNCIAS, não um scrapbook decorativo. A composição nasce do conteúdo: o assunto fornece o elemento visual. Um anúncio vira o centro da página porque está sendo analisado. Nunca criar layout primeiro e preencher com foto genérica depois.

O QUE A IMAGEM DEVE SER (ordem de preferência):
1. Anúncio, peça ou documento relacionado ao argumento
2. Print de interface, página, campanha ou relatório
3. Produto ou objeto que represente a ideia
4. Fotografia documental real
5. Imagem de arquivo incomum
A imagem entra como artefato colado na composição — recorte, página impressa, print, fragmento — nunca como fundo decorativo full-bleed.

PROIBIDO NA IMAGEM: pessoas sorrindo em reunião genérica, escritório terracota, aperto de mão, grupo corporativo artificial, pessoa olhando notebook, fotografia aspiracional sem função, tratamento cinematográfico uniforme, sépia, qualquer imagem criada apenas para preencher espaço.

TRATAMENTO: flash direto, grão, contraste de impressão, preto e branco ocasional, recorte brusco, enquadramento imperfeito, textura de impressão offset. A fotografia pode ser pequena — não precisa ser hero.

PALETA (papel NEUTRO levemente acinzentado, nunca bege dominante):
— Papel principal #F1F1EC, papel quente secundário #E9E5DA, branco de recorte #FAF9F4
— Vermelho assinatura #B32616 (precisa aparecer em todo slide, nem que num detalhe) e vermelho profundo #811F16
— Preto editorial #242321, cinza de texto #67645F
— Apoio pontual, no máximo dois por slide: amarelo marcador #E3C44A, rosa fita #E8B8B2, azul fita #AFC6D3
— Marrom, cobre e terracota NÃO são cores da marca. Nada de paleta de escritório de arquitetura.

DENSIDADE: espaço negativo controlado e TENSIONADO, nunca página vazia. O conteúdo ocupa 55-80% do slide de desenvolvimento; nenhuma área vazia contínua acima de 30%; todo vazio grande precisa ser equilibrado por elemento de borda, microtexto ou tensão tipográfica.

INTERVENÇÕES ANALÓGICAS COM FUNÇÃO: fita só existe prendendo algo (nunca flutuando), seta só existe apontando um detalhe e vem com nota curta, círculo e sublinhado só destacam palavra ou dado. De uma a três intervenções por slide — o scrapbook é editado, não acumulado. Papéis com gramaturas e bordas diferentes; nem todo recorte tem moldura branca de foto.

COMPOSIÇÃO: assimétrica, densa, tensionada. Elementos ultrapassam margens, inclinam, sobrepõem, são cortados. Cada página tem estrutura própria — alternar capa-manifesto, artefato central, frase de impacto, página analisada, lista editorial, documento, comparação, fotografia documental, colagem, dado e CTA editorial.

PROIBIDO: luxo minimalista, estética de coaching, template de Canva, apresentação empresarial, infográfico, layout centralizado, bordas arredondadas, ícones genéricos, gradiente, 3D, glassmorphism, simetria perfeita, decoração que pode ser removida sem alterar o significado.`,
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
