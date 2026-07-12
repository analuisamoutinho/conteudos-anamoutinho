const fs = require('fs');
const { PROFILES_FILE } = require('../config');

// ═══════════════════════════════════════════════════════════════════════════
// PERFIS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_PROFILES = {
  pessoal: {
    profileId: 'pessoal', tipo: 'pessoal', nome: 'Ana Moutinho',
    handle: '@analuisa.moutinho',
    niche: 'Marca pessoal, desenvolvimento humano, virtudes, vida ordenada, construção de longo prazo — contada por quem ainda está aprendendo, não por quem já chegou',
    bio: 'Ainda estou descobrindo como construir uma vida mais ordenada, virtuosa e significativa. Compartilho o que aprendo enquanto aprendo.',
    sobreMim: `Sou uma mulher movida por sentido, profundidade e construção. Não me interesso por uma vida apenas bonita por fora — gosto do que tem raiz, ordem, permanência e verdade. Tenho um olhar atento para os detalhes do cotidiano, porque acredito que a vida real se revela nas pequenas escolhas: na forma como trabalhamos, cuidamos da casa, honramos nossos vínculos, organizamos a rotina e permanecemos fiéis ao que importa.

Meu conteúdo nasce desse lugar — e ainda está sendo construído junto comigo. Falo sobre amadurecimento, rotina, fé, beleza, trabalho, autocuidado e construção de futuro. Não como performance e nem como chegada. Como caminho. Um caminho que estou trilhando agora, com tudo o que isso implica de dúvida, recomeço e aprendizado em tempo real.

Tenho sensibilidade para perceber o invisível por trás das situações comuns. Gosto de transformar experiências em reflexão, caos em linguagem, desejo em direção. Minha comunicação une firmeza e delicadeza: acolhe, mas não acomoda; inspira, mas não ilude.

Acredito que uma vida bonita não é uma vida perfeita. É uma vida com alicerce. E é isso que estou aprendendo a construir.

ESSÊNCIA DA MARCA:
Construção com profundidade — de rotina, de casa interior, de fé, de saúde, de trabalho, de presença, de relações, de beleza e de futuro. Sem pressa vazia, sem superficialidade.

MENSAGEM CENTRAL: A vida que você deseja precisa de alicerce, não apenas de desejo.

ATENÇÃO CRÍTICA: Este "sobre mim" descreve uma direção e um conjunto de valores — não uma chegada. A Ana ainda está construindo tudo isso. O conteúdo deve soar como o diário de quem tem clareza sobre o que quer mas ainda está aprendendo a viver à altura disso, não como o depoimento de quem já resolveu.`,
    manifesto: 'Defendo: rotina com propósito, profundidade acima de pressa, virtude como construção diária, honestidade sobre o processo real. Não tolero: performance vazia, vida "perfeita" de vitrine, autoajuda genérica, pressa que substitui alicerce.',
    inimigoComum: 'A cultura da pressa vazia e da vida performática nas redes: a ideia de que se precisa parecer que já chegou, de que produtividade sem propósito é virtude, e de que autoajuda genérica resolve o que só se resolve com constância e verdade.',
    tom: 'Reflexivo, íntimo, honesto sobre as próprias contradições. Fala como alguém que está no meio do processo — não como quem chegou do outro lado. Levemente provocativo, mas sem didatismo. Nunca guru, nunca coach, nunca superior. A voz é de companheira de caminhada: "eu também estou tentando entender isso". Usa primeira pessoa real: duvida, erra, recomeça, ri de si mesma às vezes.',
    proibidos: ['Desbloqueie', 'Seja sua melhor versão', 'Transforme sua vida', 'Coach', 'Mentoria', 'Sucesso', 'Fórmula', 'Método infalível', 'Próximo nível', 'Descubra', 'Segredo', 'Aprendi que', 'A verdade é que', 'O segredo é simples', 'Você precisa', 'Faça assim', 'É simples assim'],
    pilares: [
      'Vida ordenada e sistemas pessoais (o que estou tentando montar e o que ainda não funciona)',
      'Virtudes e formação de caráter (prudência, coragem, temperança, disciplina — o que li, o que tentei, onde falho)',
      'Corrida e autoaperfeiçoamento físico (o processo real, não o resultado polido)',
      'Leitura e filosofia prática (o que faz sentido pra mim, o que ainda não entendo)',
      'Bastidores do negócio e da vida intencional (as dúvidas reais, não só as vitórias)',
      'Falhas, correções e recomeços — contados com honestidade, não com moralismo',
    ],
    publicoAlvo: 'Homens e mulheres 25-38 anos que também estão tentando construir uma vida com mais ordem e intenção — e se sentem sozinhos nisso. Não buscam guru nem fórmula. Buscam alguém que também está no meio do processo e fala sobre isso com honestidade.',
    cta: 'Me conta nos comentários se você também sente isso. Salva pra quando precisar lembrar.',
    referencias: ['Sofia Coppola', 'Filosofia aristotélica e virtudes clássicas', 'Lo-fi diary aesthetic', 'Candid editorial', 'Estética minimalista clara — off-white, creme, marrom café, tons quentes neutros'],
    tiposConteudo: ['lofi', 'carrossel', 'video_curto', 'video_medio', 'frase', 'dump', 'bastidores'],
    observacoes: 'Ana está no processo de construir a vida que quer — não chegou lá. Esse é o ponto central. O conteúdo deve soar como diário aberto de alguém que está tentando, errando e aprendendo em tempo real — não como lição de quem já resolveu. Temas recorrentes: ordem na vida, planejamento, rotinas, sistemas, leitura, corrida de rua, autoaperfeiçoamento. Conflitos internos REAIS que aparecem no conteúdo: perfeccionismo vs ação, muitos interesses simultâneos, dificuldade de constância, cansaço, recomeço. A IA deve usar linguagem de quem ainda está aprendendo: "estou tentando", "não sei ainda", "errei nisso", "percebi que", "ainda não consigo", "voltei a fazer". NUNCA posicionar a Ana como referência acabada. Ela é referência pelo processo honesto, não pela chegada. Estética: elegância, minimalismo, sofisticação, tons profundos. Sem pasteis.',
    pdfUploadedAt: null, updatedAt: null,
  },
};

function loadProfiles() {
  try {
    if (!fs.existsSync(PROFILES_FILE)) {
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(DEFAULT_PROFILES, null, 2));
      return { ...DEFAULT_PROFILES };
    }
    const raw = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
    const merged = {};
    for (const key of Object.keys(DEFAULT_PROFILES)) {
      merged[key] = { ...DEFAULT_PROFILES[key], ...(raw[key] || {}) };
    }
    for (const key of Object.keys(raw)) {
      if (!merged[key]) merged[key] = raw[key];
    }
    return merged;
  } catch(e) {
    console.error('loadProfiles:', e.message);
    return { ...DEFAULT_PROFILES };
  }
}

function saveProfiles(profiles) {
  try { fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2)); }
  catch(e) { console.error('saveProfiles:', e.message); }
}

function getProfileManualContext(profileId) {
  const profiles = loadProfiles();
  const p = profiles[profileId];
  if (!p) return '';
  return [
    `TIPO DE MARCA: Marca Pessoal (Metodologia RR)`,
    p.niche        ? `NICHO: ${p.niche}`                      : '',
    p.publicoAlvo  ? `PÚBLICO-ALVO: ${p.publicoAlvo}`        : '',
    p.tom          ? `TOM DE VOZ: ${p.tom}`                   : '',
    p.manifesto    ? `MANIFESTO (Pilar 1 — o que ela defende e não tolera): ${p.manifesto}` : '',
    p.inimigoComum ? `INIMIGO COMUM (Pilar 1 — comportamento/crença que une a comunidade contra): ${p.inimigoComum}` : '',
    p.pilares?.length    ? `PILARES DE CONTEÚDOM: ${p.pilares.join(', ')}` : '',
    p.proibidos?.length  ? `TERMOS PROIBIDOS: ${p.proibidos.join(', ')}` : '',
    p.cta          ? `CTA PADRÃO DO PERFIL: ${p.cta}`         : '',
    p.sobreMim     ? `IDENTIDADE PESSOAL (quem é Ana, como ela se descreve):\n${p.sobreMim}` : '',
    p.observacoes  ? `CONTEXTO ADICIONAL: ${p.observacoes}`   : '',
  ].filter(Boolean).join('\n');
}

module.exports = { DEFAULT_PROFILES, loadProfiles, saveProfiles, getProfileManualContext };
