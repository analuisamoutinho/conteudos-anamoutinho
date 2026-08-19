const fs = require('fs');
const { PROFILES_FILE } = require('../config');

// ═══════════════════════════════════════════════════════════════════════════
// PERFIS
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// MANUAL DA MARCA — fonte da verdade (editado aqui no código, não na UI)
// ═══════════════════════════════════════════════════════════════════════════
// Ideia central da marca:
//   "Como construir empresas maiores sem construir uma vida menor."
// Frase-norte do perfil:
//   "Você já construiu alguma coisa. Agora precisa aprender a fazê-la crescer
//    sem deixar que ela consuma você."

const DEFAULT_PROFILES = {
  pessoal: {
    profileId: 'pessoal', tipo: 'pessoal', nome: 'Ana Moutinho',
    handle: '@analuisa.moutinho',
    niche: 'Marketing, negócios e decisões para quem está construindo uma empresa de verdade — aquisição, gestão, liderança, dinheiro, processos, IA e os bastidores reais de quem vive isso',
    bio: 'Para quem já tem um negócio e quer aprender a fazê-lo crescer sem depender apenas de esforço.',
    sobreMim: `Falo com quem já colocou um negócio na rua e agora enfrenta a parte difícil: crescer sem perder o controle.

Não falo de negócios de fora. Estou vivendo isso — na Case e nos projetos que construo. As reuniões, as análises, as decisões, os erros, o que mudei de opinião: tudo isso é matéria-prima do conteúdo.

Meu território é a interseção entre marketing que gera negócio e decisão empresarial. Marketing não como "fazer um post", mas como aquisição, oferta, posicionamento, conversão, CAC, LTV, funil, retenção — sempre com a pergunta: isso está ajudando a empresa a ganhar dinheiro?

E, junto disso, o que quase ninguém fala em voz alta: a solidão de decidir sozinho, o medo de investir mais e descobrir que o problema é maior, a dificuldade de delegar, a sensação de que o crescimento está aumentando o caos em vez de diminuir.

A ideia central da marca é esta: como construir empresas maiores sem construir uma vida menor.

ATENÇÃO CRÍTICA: o tom não é de guru nem de palestrante. É de alguém que está dentro da operação, decide com dados quando dá e com critério quando não dá, e fala com o empresário como par — não de cima.`,
    manifesto: 'Defendo: decisão com base em número e critério, não em feeling; marketing julgado pelo que faz a empresa ganhar; empresa que funciona sem depender do dono para tudo; ambição com vida junto. Não tolero: dica solta sem consequência, métrica de vaidade, promessa de fórmula, prestador que vende o que não entrega, crescimento que só aumenta o caos.',
    inimigoComum: 'A ideia de que basta "vender mais" e de que crescer é uma questão de esforço do dono. O resultado é um empresário que virou o gargalo da própria empresa, decide no escuro, terceiriza a esperança para agências e prestadores, e cresce faturamento enquanto perde margem, controle e vida.',
    tom: 'Direto, adulto e específico. Fala de par para par com quem tem CNPJ — nunca de cima, nunca didatismo de coach. Nomeia o que a pessoa vive mas ainda não formulou. Usa exemplo concreto, número e situação real em vez de conceito genérico. Tem opinião e assume — mas mostra o raciocínio, não só a conclusão. Pode ser provocativo; nunca motivacional.',
    proibidos: ['Desbloqueie', 'Seja sua melhor versão', 'Transforme sua vida', 'Escale seu negócio para o próximo nível', 'Coach', 'Sucesso', 'Fórmula', 'Método infalível', 'Próximo nível', 'Segredo', 'Mindset milionário', 'Faturar 6 dígitos', 'O segredo é simples', 'Você precisa', 'É simples assim', 'Basta', 'Sem esforço'],
    pilares: [
      'Marketing que gera negócio — aquisição, tráfego, oferta, posicionamento, conversão, conteúdo, mídia, CAC, LTV, funil, atendimento, retenção. Sempre com a pergunta: isso está ajudando a empresa a ganhar dinheiro?',
      'Decisões empresariais — quando aumentar (e quando não aumentar) investimento, quando contratar agência, quando o problema é processo e não pessoa, o que analisar antes de abrir uma segunda unidade, o que fazer quando o faturamento cresce e a margem cai',
      'O dono como gargalo — delegação, equipe, processos, dependência do fundador, a fase em que ser indispensável deixa de ser qualidade e vira problema',
      'Bastidores reais — reuniões, análises, decisões, erros, aprendizados, clientes, bastidores da Case, liderança, ferramentas, coisas que deram errado e opiniões que mudaram',
      'As dores que ninguém fala — solidão empresarial, medo, insegurança, comparação, exaustão, culpa, pressão, medo de crescer errado, sensação de estar atrasado',
      'Visão de mundo — trabalho, dinheiro, ambição, liderança, crescimento, tecnologia, IA, cultura empresarial e empreendedorismo. Nem todo conteúdo precisa terminar em dica.',
    ],
    publicoAlvo: `Donos de negócio e pessoas que carregam um CNPJ tentando transformar uma operação que já existe em uma empresa mais forte, lucrativa, organizada e capaz de crescer.

O segmento importa pouco (restaurante, clínica, odontologia, loja, franquia, empresa de serviços, e-commerce, agência, negócio local, B2B). O que une é o MOMENTO EMPRESARIAL: já colocou o negócio na rua e agora enfrenta a parte difícil — crescer sem perder o controle. NÃO é para quem está pensando em abrir um negócio.

PERSONA CENTRAL: o empresário que olha para o próprio negócio e pensa "isso aqui poderia ser muito maior do que é". Já vende, já tem clientes, talvez tenha equipe, talvez invista em anúncios, talvez tenha agência, talvez fature bastante. Mas sente que há dinheiro sendo perdido, oportunidade desperdiçada e decisão tomada no feeling. E, principalmente: ele ainda é uma peça importante demais para a empresa funcionar.

A GRANDE TENSÃO: não é "quero faturar mais". É "quero construir uma empresa maior sem precisar carregar tudo sozinho".

O QUE ELE DIZ: "Preciso vender mais." · "Meu tráfego não está funcionando." · "Os leads são ruins." · "Minha equipe não entrega." · "Preciso organizar a empresa." · "Não sei onde estou perdendo dinheiro." · "Quero contratar alguém para cuidar do marketing." · "Preciso melhorar meu posicionamento." · "Quero abrir outra unidade." · "Preciso delegar." · "Quero que a empresa dependa menos de mim."

O QUE ELE NÃO DIZ (território mais forte para o conteúdo): "Não sei se estou tomando as decisões certas." · "Minha empresa fatura, mas eu não sinto segurança." · "Tenho vergonha de admitir que não entendo todos os números." · "Se eu parar de trabalhar, muita coisa para." · "Criei um negócio para ter liberdade e criei um trabalho que me persegue." · "Não sei se o problema é o marketing, minha equipe, minha oferta ou eu." · "Tenho medo de investir mais e descobrir que o problema é maior do que imaginava." · "Já fui enganado por prestador." · "Não confio que as pessoas vão fazer como eu faria." · "Estou cansado de decidir sozinho." · "Tenho medo de que o crescimento esteja aumentando o caos." · "Não quero chegar daqui a cinco anos com uma empresa maior e uma vida pior."`,
    cta: 'Se você se reconheceu, me conta nos comentários como isso aparece na sua empresa. Salva para revisitar na próxima decisão.',
    referencias: ['Editorial + humano + espontâneo + inteligente + brasileiro', 'Fotos reais de reunião, mesa de trabalho, caderno e tela do computador', 'Prints e anotações à mão', 'Tipografia com personalidade e textos grandes', 'Texturas — nada de mockup 3D ou apresentação corporativa'],
    tiposConteudo: ['cultural', 'tese', 'autoral', 'oferta', 'frase', 'lofi', 'video_curto', 'video_medio'],
    observacoes: `IDEIA CENTRAL DA MARCA: "Como construir empresas maiores sem construir uma vida menor."
FRASE-NORTE: "Você já construiu alguma coisa. Agora precisa aprender a fazê-la crescer sem deixar que ela consuma você."

POSICIONAMENTO: não é "Ana, especialista em marketing" (pequeno demais) nem "Ana, mentora de empresários" (genérico demais). É: marketing, negócios e decisões para quem está construindo uma empresa de verdade.

AUDIÊNCIA ÚNICA: o perfil não tem segunda audiência. Tudo — liderança, vendas, gestão, equipe, posicionamento, dinheiro, processos, tecnologia, IA, atendimento, decisão, produtividade, erros, bastidores, ambição, medo, cansaço, liberdade, vida — conversa com o mesmo dono de negócio.

RELAÇÃO COM A CASE: a Case é a manifestação empresarial do que o perfil defende. No perfil: "o empresário precisa parar de tomar decisões no escuro." Na Case: como o diagnóstico tira uma empresa do escuro. No perfil: "mais leads não resolvem um atendimento ruim." Na Case: o diagnóstico de um caso real. O perfil cria demanda pela visão; a Case gera confiança na solução.

RÉGUA — antes de aprovar qualquer conteúdo, as 5 perguntas precisam ser SIM:
1. Isso fala com alguém que JÁ possui um negócio?
2. Ele consegue se reconhecer em uma situação concreta?
3. Existe uma tensão ou problema real aqui?
4. Estou dizendo algo que essa pessoa precisava ouvir mas talvez não soubesse formular?
5. Isso reforça a visão da Ana sobre negócios?

ESTÉTICA: nada de agência premium tradicional — visual perfeito, minimalista corporativo, serifas por toda parte, grids impecáveis, mockups, elementos 3D e cara de apresentação transmitem distância. Buscar editorial + humano + espontâneo + inteligente + brasileiro. Posts que parecem feitos por uma pessoa, não por um departamento de branding: texturas, fotos reais, tipografia com personalidade, textos grandes, escrita à mão em alguns momentos, prints, anotações, foto de reunião, mesa de trabalho, caderno, tela do computador, bastidores. Menos "olha como minha marca é sofisticada", mais "eu sei exatamente o que você está vivendo".`,
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
    // O manual da marca vive no código (DEFAULT_PROFILES) — ele é a fonte da
    // verdade e sobrepõe o que estiver gravado em disco. Do ficheiro só
    // aproveitamos estado de runtime (upload de PDF, timestamp).
    const RUNTIME_KEYS = ['pdfUploadedAt', 'updatedAt'];
    for (const key of Object.keys(DEFAULT_PROFILES)) {
      const stored  = raw[key] || {};
      const runtime = {};
      for (const k of RUNTIME_KEYS) if (stored[k] != null) runtime[k] = stored[k];
      merged[key] = { ...stored, ...DEFAULT_PROFILES[key], ...runtime };
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
    `TIPO DE MARCA: Marca Pessoal (metodologia BrandsDecoded)`,
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
