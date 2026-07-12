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

// DNA visual absorvido das coleções reais da Ana (BrandClub: Anúncios [E031]
// + StudioMoulin), exportadas do Canva e analisadas slide a slide.
// Base fotográfica comum a todos os estilos de carrossel:
const FOTO_BASE_ANA = `BASE FOTOGRÁFICA (comum à identidade dos carrosséis da Ana):
— Fotografia editorial lo-fi em full-bleed (a foto ocupa o slide inteiro, sem molduras)
— Grain de filme analógico visível, luz natural difusa (manhã, janela, sombras longas de sol)
— Paleta neutra quente: creme, areia, linho cru, madeira, couro caramelo, taupe, terracota suave
— Cenas íntimas do cotidiano vistas de cima ou em close: chávena de café, cama de linho amarrotado, livro aberto, laptop na mesa de madeira, tapete de yoga com luz de janela, mãos, pés descalços, selfie de espelho sem mostrar o rosto inteiro
— Pessoas sempre anónimas ou parciais (costas, mãos, silhueta, sombra projetada) — nunca sorriso posado de banco de imagens
— Véu escuro quente e subtil sobre a foto (~30-40%) para dar legibilidade a texto claro por cima
— Zona central do enquadramento relativamente calma e desimpedida (é onde entra o texto)
— PROIBIDO: estúdio, flash duro, cores saturadas frias, azul/verde vivos, visual corporativo ou de coach`;

const DEFAULT_CANVA_TEMPLATES = [
  {
    id: 'tmpl_ana_carrossel_001', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Editorial Typewriter',
    contentTypes: ['carrossel'],
    aesthetic: 'Foto lo-fi quente em full-bleed + texto typewriter branco centrado, itálico nas palavras-chave — reflexivo e intimista',
    visualDNA: `${FOTO_BASE_ANA}

ESTILO DESTE TEMPLATE (Editorial Typewriter — para carrosséis reflexivos/filosóficos):
— Cada slide é UMA fotografia diferente do mesmo universo (café, cama, areia, linho, laranjas ao sol) mantendo paleta e grain coerentes
— Atmosfera contemplativa e silenciosa, como um diário fotográfico analógico
— O texto (aplicado por cima via overlay) é monoespaçado tipo máquina de escrever, branco, centrado no terço superior/médio; a foto deve deixar essa zona respirar
— Mood de referência: Kinfolk, fotografia documental europeia, luz de fim de tarde`,
    slideCount: 8, canvaUrl: 'https://www.canva.com/design/DAHOYMschTo/7-wmTI9UhBd_fS6CmNPgjw/edit', profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_carrossel_002', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Cartões sobre Foto',
    contentTypes: ['carrossel'],
    aesthetic: 'Foto neutra clara + dois cartões sobrepostos (creme com título marrom / taupe translúcido com texto branco) — para dicas e listas',
    visualDNA: `${FOTO_BASE_ANA}

ESTILO DESTE TEMPLATE (Cartões sobre Foto — para carrosséis de dicas/passos/listas):
— Fotografias claras e serenas em tons de branco, creme e taupe: quarto com roupa de cama branca, sofá de linho, mesa de madeira clara com laptop e copo de água ao sol
— Luz suave de manhã com sombras delicadas; composição com objetos no terço superior e inferior, centro calmo
— CAPA: foto com pessoa anónima (selfie de espelho tapando o rosto, corpo parcial) e espaço central para título grande
— O texto entra por cima em dois cartões sobrepostos: um creme (#F5F1EA) com título marrom escuro em negrito, outro taupe acastanhado translúcido (#8A7A69) com texto branco — a foto deve suportar esses blocos no centro
— Sensação: acolhedor, prático, elegante sem esforço`,
    slideCount: 8, canvaUrl: 'https://www.canva.com/design/DAHOYBvMcGQ/gyafs_lB36VerRbIBEBbFw/edit', profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_carrossel_003', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Handwriting Leve',
    contentTypes: ['carrossel', 'bastidores', 'dump'],
    aesthetic: 'Foto lifestyle real + título manuscrito arredondado branco com contorno marrom, anotações com setinhas — tom leve e próximo',
    visualDNA: `${FOTO_BASE_ANA}

ESTILO DESTE TEMPLATE (Handwriting Leve — para carrosséis leves, bastidores, hábitos):
— Fotografias lifestyle reais e espontâneas: pessoa no sofá com laptop, café gelado na mesa, caderno de planeamento com caneta, cama com pequeno-almoço — sempre com rosto tapado ou fora de quadro
— Tons quentes com pontos de interesse (madeira, plantas, tricot cru, jeans) e grain analógico
— O texto entra por cima em letra manuscrita arredondada branca com leve contorno/sombra marrom, com asteriscos e setinhas desenhadas à mão — a foto deve ter uma faixa central relativamente limpa
— SLIDE FINAL (CTA): fundo LISO castanho-café escuro (#3F2E23), sem foto, apenas textura mínima
— Sensação: amiga que partilha o que funciona, zero formalidade`,
    slideCount: 8, canvaUrl: 'https://www.canva.com/design/DAHOYK2q-Y0/DmZTpOUXjL2OHsSYSLG-bQ/edit', profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_frase_004', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Frase Ana — Serifada em Fundo Marrom',
    contentTypes: ['frase'],
    aesthetic: 'Fundo liso marrom quente + frase grande em serifada editorial branca com itálico — statement de impacto',
    visualDNA: `ESTILO DESTE TEMPLATE (Frase Serifada — post estático de frase de impacto):
— Fundo completamente LISO em marrom quente médio (#5E4F3F) ou castanho-café profundo (#43301F), com textura mínima de papel
— SEM fotografia, SEM elementos gráficos — o protagonismo é 100% da tipografia
— A frase (aplicada por overlay) é serifada editorial estilo Didot, branca, grande, centrada, com as palavras-chave em itálico bold
— Handle pequeno em letras espaçadas abaixo da frase
— Sensação: página de livro, statement calmo e definitivo`,
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_carrossel_005', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Tipografia Mista + Anotações',
    contentTypes: ['carrossel', 'lofi'],
    aesthetic: 'Foto urbana/desportiva neutra + título misto (sans bold + serifada itálica) com destaque amarelo-manteiga e anotações manuscritas — para temas de treino e disciplina',
    visualDNA: `${FOTO_BASE_ANA}

ESTILO DESTE TEMPLATE (Tipografia Mista — para carrosséis de corrida, treino, disciplina, rotina):
— Fotografias com energia contida: ténis de corrida na rua, roupa desportiva em tons neutros (cinza, verde-oliva, cru), café gelado na bancada, toalha na cabeça pós-banho — corpo parcial, sem rosto
— Paleta neutra urbana com UM acento pontual amarelo-manteiga suave (#EFE3A8)
— Luz natural, grain analógico, enquadramentos de street photography casual
— O texto entra por cima misturando sans-serif bold branca e serifada itálica, com uma palavra destacada em amarelo-manteiga e pequenas anotações manuscritas com setinhas — o centro da foto deve ficar respirável
— Sensação: processo real de treino, sem pose de fitness influencer`,
    slideCount: 8, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_001', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Frase Ana — Serena Etérea Serifada',
    contentTypes: ['frase'],
    aesthetic: 'Foto etérea clara (céu, campo dourado, linho, flor branca) + frase serifada elegante com itálico e molduras finas — statement sereno de acolhimento',
    visualDNA: `BASE FOTOGRÁFICA (coleção Serena — posts estáticos de frase):
— Fotografia etérea, suave e luminosa em full-bleed: céu com nuvens leves, campo de trigo/aveia dourado ao entardecer, cortinas de linho cru com luz difusa, flor branca em close, pés descalços com vestido esvoaçante, mãos femininas delicadas
— Pessoas sempre parciais e anónimas: mãos ao alto, braço estendido, costas, silhueta — nunca rosto em destaque
— Paleta clara e quente: branco-nata (#F4F0E8), areia (#D9C9AF), dourado suave (#C7A578), castanho médio (#6B5442), toques de céu azul-acinzentado muito dessaturado
— Luz natural difusa de fim de tarde, leve haze/névoa, grain subtil de filme; nada saturado, nada duro
— Grandes áreas calmas (céu, parede, tecido) no terço superior/central — é aí que entra a frase por overlay
— O texto (aplicado por overlay) é serifado editorial estilo Didot, com palavras-chave em itálico, em branco sobre foto escura ou castanho (#5C4634) sobre foto clara; detalhes gráficos finos: molduras de linha 1px, círculo desenhado à volta de palavra, pequeno selo "leia a legenda"
— Sensação: pausa, leveza, acolhimento — como respirar fundo num campo ao entardecer
— PROIBIDO: cores vivas, visual corporativo, stock photography posada, flash duro`,
    slideCount: 1, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_002', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Serena Colagem Minimal Clara',
    contentTypes: ['carrossel', 'frase'],
    aesthetic: 'Fundos creme nevoados quase vazios + serifa castanha e pequenas colagens vintage (borboleta, flor prensada, fita washi) — didático e delicado',
    visualDNA: `ESTILO DESTE TEMPLATE (Serena Colagem Minimal — para carrosséis didáticos/emocionais suaves):
— Fundos MUITO claros e quase lisos: off-white nevoado (#F2EFE9) com manchas suaves de luz/névoa, ou textura mínima de papel; ocasionalmente meia foto (silhueta atrás de cortina ao sol, tecido ao vento) ocupando metade do slide
— Paleta: creme (#F2EFE9), greige (#DDD6CB), castanho (#5F4B38); nenhum tom frio
— Elementos de colagem vintage delicados e pequenos: borboleta/traça em gravura, flor seca prensada colada com fita washi, retângulos greige lisos como blocos de apoio
— Composição assimétrica com MUITO espaço vazio; um pensamento por slide; linhas finas de canto ligando blocos de texto
— O texto entra por overlay: título serifado editorial castanho (itálico nas palavras-chave) + apoio em sans leve ou serifa pequena; faixa/tag greige com texto branco para frases de contexto
— SLIDE FINAL (CTA): fundo creme liso, coração pequeno greige, frase serifada centrada tipo "salva esse post"
— Sensação: caderno de terapia bonito, silêncio, delicadeza intencional
— PROIBIDO: poluição visual, cores saturadas, fotos escuras dominantes`,
    slideCount: 7, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_003', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Serena Verde-Oliva Editorial',
    contentTypes: ['carrossel', 'lista'],
    aesthetic: 'Fotos de natureza escurecidas + slides lisos verde-oliva profundo com serifa creme, checklists e ticker "passe para o lado" — editorial profundo',
    visualDNA: `ESTILO DESTE TEMPLATE (Serena Verde-Oliva — para carrosséis reflexivos profundos, padrões, listas):
— Alterna dois tipos de slide: (a) fotografia de natureza/campo escurecida com véu verde-oliva (mulher anónima deitada na relva com livro, pés descalços na terra, mar ao fundo, campo) e (b) fundo LISO verde-oliva profundo (#3E3D26) com textura orgânica subtil tipo moiré/tecido
— Paleta: verde-oliva escuro (#3E3D26 a #4A4A30), creme-marfim (#EDE8DC), bege (#C9BFA8); acentos em linha fina creme
— Elementos gráficos: blocos retangulares oliva mais escuros atrás de títulos, checkboxes quadradas finas com visto, elipse/círculo fino desenhado à volta de frases, setas finas, linha diagonal decorativa
— Detalhe de identidade: faixa ticker nas margens superior/inferior com texto pequeno repetido ("passe para o lado", "salve esse post")
— O texto entra por overlay: títulos em serifada editorial creme (itálico nas palavras-chave), corpo em sans leve creme — os slides devem manter o centro respirável para estes blocos
— Sensação: floresta ao entardecer, profundidade calma, autoridade suave
— PROIBIDO: verdes vivos/saturados, visual de infográfico corporativo, branco puro estourado`,
    slideCount: 7, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_004', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Serena Interiores Âmbar + Handwriting',
    contentTypes: ['carrossel', 'bastidores'],
    aesthetic: 'Fotos íntimas escurecidas em luz âmbar (vela, café, vinho, cortina ao sol) + sans branco fino e anotações manuscritas — confessional e próximo',
    visualDNA: `ESTILO DESTE TEMPLATE (Serena Interiores Âmbar — para carrosséis confessionais, bastidores, "verdades duras", troque isso por aquilo):
— Cada slide é UMA fotografia full-bleed de cena íntima em luz âmbar de fim de tarde, escurecida com véu quente (~40%): vela acesa, chávena de café/chá vista de cima, copo de vinho com livro à noite, caderno com caneta, cortina laranja com sol, cadeira de palhinha, escada de madeira, sombra de janela na parede
— Pessoas apenas em fragmentos: mão no teclado, mãos segurando caneca, mulher de costas na rua ou de bicicleta desfocada — nunca rosto
— Paleta: castanhos quentes profundos (#3A2A1E, #6B4F38), âmbar (#B98A5A), creme (#EFE6D8); grain analógico forte, mood noturno acolhedor
— O texto entra por overlay em duas vozes: frase principal em sans-serif fina/média branca + complemento em letra MANUSCRITA branca casual; ocasionalmente etiquetas arredondadas estilo sticker bege ("troque isso" / "por isso") e setinhas finas desenhadas
— A zona do texto (terço superior ou centro) deve ficar em área escura e calma da foto
— SLIDE FINAL (CTA): foto ainda mais escura ou parede lisa castanha, frase manuscrita sublinhada tipo "salva esse post"
— Sensação: conversa sincera à luz de vela, amiga que admite as próprias falhas
— PROIBIDO: luz fria, cenas de estúdio, sorrisos posados, cores saturadas`,
    slideCount: 7, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_005', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Serena Cartões Bege',
    contentTypes: ['carrossel', 'lista'],
    aesthetic: 'Fundo bege-pedra + cartões arredondados off-white sobrepostos com serifa escura e setinhas finas — sequência de verdades em tom calmo',
    visualDNA: `ESTILO DESTE TEMPLATE (Serena Cartões Bege — para carrosséis de verdades/pontos sequenciais com tom terapêutico):
— Fundo bege-pedra acinzentado (#DED9CC) praticamente liso, com leve textura de papel; nos slides pode entrar uma tira vertical de fotografia quente (campo dourado desfocado, mão com flor) espreitando na lateral
— Sobre o fundo, DOIS cartões de cantos muito arredondados sobrepostos em cascata: um off-white (#F6F3EC) com contorno fino greige para o título, outro bege translúcido para o texto de apoio; pequena seta curva fina apontando para o slide seguinte
— Paleta: bege (#DED9CC), off-white (#F6F3EC), castanho-escuro do texto (#3B342A), dourado seco (#B9A886) nos detalhes
— CAPA: foto quente com objeto em recorte estilo colagem (contorno branco de sticker) + título misto serifa/script
— O texto entra por overlay: título em serifada editorial escura centrada no cartão branco; apoio em sans leve no cartão bege — as imagens geradas devem deixar a zona central limpa para os cartões
— Sensação: fichas de psicoeducação elegantes, calma estruturada, uma ideia de cada vez
— PROIBIDO: cores fortes, sombras duras, visual de slide corporativo`,
    slideCount: 6, canvaUrl: null, profile: 'pessoal',
  },
  {
    id: 'tmpl_ana_serena_006', createdAt: '2026-07-12T00:00:00.000Z',
    name: 'Carrossel Ana — Serena Marrom Chocolate + Papel',
    contentTypes: ['carrossel', 'frase'],
    aesthetic: 'Fundos marrom-chocolate profundos texturados + manuscrita creme, molduras finas e colagens de papel rasgado — intenso mas acolhedor',
    visualDNA: `ESTILO DESTE TEMPLATE (Serena Marrom Chocolate — para carrosséis de progresso emocional e frases de peso):
— Fundos LISOS em castanhos profundos: chocolate (#4A2E1D), café escuro (#2F2015) e terracota queimada (#7A4630), com textura subtil de tecido/linho; alterna com slides bege claro (#EDE7DC) onde entra um grande bloco retangular marrom com o texto
— CAPA opcional: foto de campo dourado escurecida (mulher anónima de vestido tocando flores secas) com título em sans fina branca
— Elementos de colagem analógica: pedaço de mapa antigo rasgado, papel kraft rasgado com fita, pequenas flores secas coladas — sempre discretos, um por slide
— Molduras de linha fina creme à volta dos blocos de texto; setas curvas manuscritas ligando anotações
— O texto entra por overlay em três vozes: sans-serif branca/creme com palavras em bold, serifa editorial creme, e anotações em MANUSCRITA creme ("mesmo que pareça pouco", "mesmo que ninguém veja") — centro do slide sempre respirável
— Sensação: diário íntimo encadernado em couro, verdade dita com carinho, profundidade quente
— PROIBIDO: preto puro, cores frias, gradientes artificiais, visual de anúncio`,
    slideCount: 6, canvaUrl: null, profile: 'pessoal',
  },
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
