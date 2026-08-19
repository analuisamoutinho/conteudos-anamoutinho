const { BRAND_IDENTITIES, getAccount, getManualText } = require('./brand');

// ═══════════════════════════════════════════════════════════════════════════
// METODOLOGIAS DE CONTEÚDOM
// ═══════════════════════════════════════════════════════════════════════════

const METODOLOGIA_RR = {
  nome: 'Metodologia RR — Bolha RR (Robert Rezende), 7 Pilares',
  filosofia: `
FILOSOFIA BASE (Metodologia RR):
- Conteúdo não é venda, é transformação. Produza com intenção genuína, não para vender.
- Sirva antes de cobrar. Gere tanto valor que quando cobrar pareça barato.
- Autenticidade supera produção. Pessoas conectam com pessoas, não com personagens polidos.
- Profundidade acima de brevidade. Um conteúdo que conecta de verdade vale mais que dez rasos.
- Perfil morno não engaja e não vende. Ter ponto de vista claro é o que atrai comunidade, não o que vende.
`,
  posicionamento: `
PILAR 1 — POSICIONAMENTO & BANDEIRA:
- Toda peça de conteúdo deve deixar claro o que a Ana defende e o que ela não tolera. Não é polêmica gratuita — é ponto de vista.
- Use o "inimigo comum" do perfil (um comportamento, crença ou hábito — nunca uma pessoa) como pano de fundo quando fizer sentido: é isso que une quem lê.
- Seja incopiável: fale de vivência real, opinião e visão de mundo — nunca do genérico que qualquer IA produziria.
`,
  storytelling: `
PILAR 2 — STORYTELLING (a arte de não ser ignorado):
- Fale na terceira pessoa sobre o público sempre que possível: em vez de "eu faço isso", prefira "quem vive isso sente exatamente...". A pessoa precisa se ver no conteúdo, não só ouvir sobre a vida da Ana.
- Construa personagens recorrentes do universo da Ana quando fizer sentido (o crítico interno, a versão performática, a "eu de antes") — arquétipos que a audiência reconhece com o tempo.
- Pense em "novela diária": cada peça pode ser um capítulo — uma continuação, uma dúvida em aberto, um desdobramento — que dá vontade de acompanhar o próximo.
- O atrito e o contraste engajam mais que o consenso morno: nomear uma tensão real (perfeccionismo vs ação, pressa vs alicerce) gera mais identificação que afirmação genérica positiva.
- Observe o cotidiano como fonte: pequenas cenas reais valem mais que frases de efeito descoladas da vida.
`,
  audienciaComunidade: `
PILAR 3 — AUDIÊNCIA VS. COMUNIDADE:
- Audiência é número (consome e some). Comunidade é relação (se identifica, defende, volta, compra de novo).
- Para construir comunidade, o conteúdo precisa oferecer: identidade compartilhada (linguagem própria, sensação de pertencimento), prova de transformação (não só o resultado, mas a lógica e o princípio por trás dele) e espaço de conversa real (pergunta aberta, convite ao diálogo — não só afirmação fechada).
`,
  ramificacoes: `
PILAR 4 — RAMIFICAÇÕES DE CONTEÚDO (a função estratégica de cada peça):
Toda peça de conteúdo cumpre uma destas funções — escolha a mais adequada ao tema antes de escrever:
- INIMIGO COMUM: nomeia o comportamento/crença que a Ana não tolera. Gera identidade e engajamento.
- DESEJO DO PÚBLICO: mostra a vida, o processo, os bastidores do que o público deseja construir. Atrai e retém.
- DOR DO PÚBLICO: nomeia um erro comum ou dificuldade real. Conscientiza e aproxima.
- PROVA DE TRANSFORMAÇÃO: um resultado real (da Ana ou de quem ela influenciou) com o princípio replicável explicado — nunca só o print do resultado.
- ENTRETENIMENTO/OBSERVAÇÃO: cenas do cotidiano, situações reais, leveza. Alimenta o algoritmo e atrai gente nova.
- FERRAMENTA/MICRO-TRANSFORMAÇÃO: um checklist, um passo a passo pequeno e aplicável — gera valor imediato.
Regra de ouro: não fale do "produto" (a vida ideal, o alicerce) — fale da vida de quem ainda está construindo isso, como o público vive.
`,
  escadaCompromisso: `
PILAR 5 — ESCADA DE COMPROMISSO (vender sem vender):
Venda chata é oferta antes da confiança. Venda elegante é a oferta formalizar uma decisão que já estava madura.
Ao escrever um CTA, escolha o tipo mais adequado — nunca force a oferta:
- CTA DE PERMISSÃO: "se quiser, conto/mando mais sobre isso" — convite, não imposição.
- CTA DE TRIAGEM: "se você sente A, comenta A; se sente B, comenta B" — entende antes de oferecer.
- CTA DE FILTRO: "isso aqui não é pra todo mundo, e tudo bem" — eleva o valor percebido sem parecer carente.
Na maior parte do conteúdo pessoal da Ana, o CTA certo é de permissão ou reflexão íntima ("me conta se você também sente isso", "salva pra reler") — sem pressão de venda.
`,
  concordes: `
PILAR 6 — ARRANCAR CONCORDES:
- Uma sequência de afirmações que o leitor confirma mentalmente ("é verdade, isso acontece comigo") constrói confiança rápido.
- Use isso especialmente no gancho e nos primeiros slides/segundos: nomeie 2-4 situações específicas e reconhecíveis antes de desenvolver a ideia central.
`,
  produtoEMentalidade: `
PILAR 7 — PRODUTO NASCE DA AUDIÊNCIA / MENTALIDADE RR:
- O conteúdo vem antes do produto: primeiro entende o que o público pede, o produto (se houver) nasce disso.
- Repetição é poder: não tenha medo de retomar os mesmos temas centrais (crescer sem virar gargalo, decisão com critério, marketing que gera negócio, delegação, margem, bastidores reais) de ângulos diferentes.
- Ação antes da perfeição: o conteúdo pode ser imperfeito — autenticidade importa mais que produção polida.
`,
  estruturaViral: `
ESTRUTURA DE CONTEÚDO (aplicando os pilares acima):
1. GANCHO (primeiros 3 segundos / primeiro slide): toca na DOR ou DESEJO real, idealmente puxando 1-2 concordes específicos.
2. DESENVOLVIMENTO: conecta com o gancho, mantém a tensão/interesse, cumpre a função escolhida no Pilar 4 (Ramificações).
3. CONCLUSÃO / TESE: sem conclusão, o conteúdo é tirado de contexto — feche com uma ideia clara, não solta.
4. CTA (quando houver): escolha entre permissão, triagem ou filtro (Pilar 5). Nunca insistente.
5. TEMA ESPECÍFICO: fale na 3ª pessoa sobre quem vive aquilo, cite a situação concreta, não o genérico.
`,
  formatos: `
FORMATOS DISPONÍVEIS PARA MARCA PESSOAL (Metodologia RR):
- LO-FI (câmera ligada, fala direta): maior ROI para quem tem oratória.
- CARROSSEL: ideal para quem comunica bem por texto.
- VÍDEO CURTO (até 13s): exige sacada impactante em poucos segundos.
- VÍDEO MÉDIO (até 1min): equilibra alcance e profundidade.
- FRASE (estilo Twitter): para quem impacta com poucas palavras.
`,
  tonsProibidos: ['motivacional genérico', 'guru', 'coach', 'desbloqueie', 'seja sua melhor versão', 'transforme sua vida', 'fórmula secreta', 'método infalível', 'próximo nível'],
  tonsPermitidos: ['íntimo', 'direto', 'reflexivo', 'provocativo', 'autêntico', 'observador', 'vulnerável sem ser fraco', 'real', 'honesto'],
  tiposConteudo: ['cultural', 'tese', 'autoral', 'oferta', 'frase', 'lofi', 'video_curto', 'video_medio'],
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANDS DECODED — editorias, padrões de hook e estrutura de carrossel
// Fonte: material Brand The Code™ (4 editorias fixas), Headline Generator
// (padrões + gatilhos + anti-padrões) e Content Machine (contrato da capa,
// estrutura de 18 textos e disciplina de escrita).
// ═══════════════════════════════════════════════════════════════════════════

const BRANDS_DECODED = {
  nome: 'Brands Decoded — Brand The Code™ (4 editorias fixas)',

  editorias: `
AS 4 EDITORIAS FIXAS (Brand The Code™):
O algoritmo reconhece padrões. Girar sempre as mesmas 4 editorias treina o algoritmo
e o público a reconhecerem o perfil. Repetir um padrão funcional é o que gera escala orgânica.
1. CULTURAL / TREND — lê um fenômeno, comportamento ou mudança de época e conecta ao mundo de quem tem negócio.
2. TESE DE NEGÓCIO — uma afirmação defensável sobre como negócios funcionam, sustentada por mecanismo e evidência.
3. POST AUTORAL — visão de mundo. Opinião assumida sobre trabalho, dinheiro, ambição, liderança, tecnologia. Não precisa terminar em dica.
4. OFERTA DIRETA — conteúdo que convida para algo real (diagnóstico, conversa, material), com CTA explícito.
`,

  formula: `
FÓRMULA MÍNIMA DE PERFIL DE AUTORIDADE: Big Idea + Conteúdo Narrativo + Convite Estratégico.
- Big Idea: qual experimento está sendo vivido, qual tese está sendo testada.
- Narrativa: o post conta uma história ou só informa? Precisa contar.
- Convite: cada conteúdo direciona para algo real ou só entretém?
Todo post é uma oferta. Ninguém lembra dos posts ruins.
`,

  padroesHook: `
PADRÕES DE HOOK DE ALTA PERFORMANCE (priorizar):
1. BRASIL / CONTEXTO NACIONAL — quando dá para conectar à identidade brasileira, comportamento local ou fenômeno do país.
2. FIM / MORTE / CRISE — quando há mudança estrutural, perda, colapso, esgotamento ou substituição.
3. GERACIONAL — quando envolve Gen Z, millennials, boomers, faixa etária, vida adulta.
4. NOVIDADE — nova tendência, nova fase, nova lógica, nova regra, modelo emergente.
5. INVESTIGANDO — tom jornalístico, documental, analítico.
6. CONTRASTE / ANTÍTESE — tensão entre dois polos (velho vs novo, status vs saúde, algoritmo vs autenticidade).
7. PERGUNTA GERACIONAL — quando um grupo adota comportamento inesperado.
8. REFERÊNCIA POP / NOME PRÓPRIO — quando um nome, marca ou fenômeno ancora a atenção na hora.
`,

  gatilhos: `
GATILHOS EMOCIONAIS — todo hook precisa ativar PELO MENOS 2 ao mesmo tempo:
nostalgia · medo/alerta · indignação · identidade · curiosidade · aspiração
Combinações fortes: nostalgia+identidade · medo+geracional · brasil+identidade ·
curiosidade+nostalgia · contraste+curiosidade · novidade+alerta
`,

  anotacoes: `
ANOTAÇÕES À MÃO — a intervenção precisa ANALISAR, nunca ser placeholder:
- PROIBIDO: "olha esse detalhe", "o detalhe está aqui", "importante", "veja isso", interrogação solta.
- A anotação comenta exatamente o que a seta aponta e diz algo que só cabe NAQUELE conteúdo.
- Bons exemplos: "a operação ainda depende do dono" · "sem margem, não existe expansão" ·
  "quem decide quando você não está?" · "o caixa precisa suportar os dois endereços".
- Máximo 12 palavras. Se não houver observação específica a fazer, devolver null — melhor
  nenhuma anotação do que uma genérica.
`,

  copy: `
COPY DOS SLIDES — afiada, não apostila:
- Evitar rótulo de matéria escolar antes do conteúdo ("Capacidade Atual:", "Gestão de Tempo:",
  "Cultura Empresarial:"). Ir direto à tensão.
- Fraco: "Capacidade Atual: Sua primeira unidade é autossuficiente?"
  Forte: "A primeira unidade funciona sem você?"
- Fraco: "Gestão de Tempo: Sua rotina suporta uma nova operação?"
  Forte: "Sua agenda comporta outra unidade — ou nem a primeira?"
- Fraco: "Cultura Empresarial: Sua equipe compreende e propaga a visão?"
  Forte: "A cultura continua quando você sai da sala?"
- O título do slide e o corpo não podem dizer a mesma coisa com outras palavras.
`,

  contratoCapa: `
CONTRATO DA CAPA (a parte mais importante do carrossel):
TEXTO 1 — hook principal:
- priorizar, quando possível, a estrutura: afirmação provocativa + dois-pontos + pergunta
- precisa abrir tensão, curiosidade, identidade, contraste ou alerta
- deve funcionar isoladamente
- MÍNIMO 14 e MÁXIMO 18 palavras (contar antes de entregar)
TEXTO 2 — subhook:
- aprofunda, tensiona ou concretiza a leitura aberta pelo texto 1
- NÃO entrega a resolução do carrossel — gera curiosidade, mistério ou chamada contraintuitiva
- precisa funcionar isoladamente, não pode depender sintaticamente do texto 1
- não pode começar com conectivo de continuação
- MÍNIMO 8 e MÁXIMO 12 palavras (contar antes de entregar)
REGRAS GERAIS DA CAPA:
- descartar capa que só nomeie o tema, pareça subtítulo de artigo, explique demais,
  esteja correta mas morna, use abstração vaga, fórmula cansada ou contraste sem stake
- se a fórmula com dois-pontos deixar o texto artificial ou fraco, usar outra estrutura de alta tensão
`,

  antiPadroes: `
ANTI-PADRÕES PROIBIDOS (rejeitar e reescrever):
1. DECLARAÇÃO DIRETA — abrir afirmando algo sem tensão.
2. REVELAÇÃO GENÉRICA — nunca abrir com descubra, saiba, conheça, aprenda.
3. LISTA SATURADA — evitar "5 dicas", "3 formas", "7 lições", "10 erros".
4. MOTIVACIONAL VAZIO — frase inspiracional sem conflito real.
5. TOM GENÉRICO DE IA — linguagem impessoal, óbvia, que qualquer conta produziria.
6. PRESS RELEASE — notícia corporativa, texto institucional frio.

CONSTRUÇÕES PROIBIDAS EM QUALQUER SAÍDA:
travessão (—) · "não é X, é Y" · "menos X, mais Y" · "a pergunta que fica" · "o ponto é" ·
"no fim das contas" · "e isso muda tudo" · "colapso silencioso" · a palavra "cena" ·
a palavra "virou" em headline/hook · "quando X vira Y" · "a ascensão de" · "o impacto de" ·
"por que X está mudando" · dois-pontos no texto final dos slides · emojis no hook

DISCIPLINA INTERNA — antes de entregar, remover: AI slop, fórmulas cansadas, frases com cara
de tradução, jargão corporativo, abstração vazia, pares simétricos, slogans quebrados, texto
picotado, omissão de artigos. Se não soar natural como jornalismo brasileiro, reescrever.
Sem inventar fatos, números, datas, locais, pesquisas ou fontes.
`,

  estruturaCarrossel: `
ESTRUTURA DO CARROSSEL (Content Machine) — 9 slides, 18 textos:
- Slide 1 (CAPA): texto 1 = hook (14-18 palavras) + texto 2 = subhook (8-12 palavras)
- Slides 2, 4, 6, 7: título (11-15 palavras) + 2 parágrafos (25-32 palavras cada)
- Slides 3 e 5: parágrafo curto (22-26 palavras), sem título
- Slide 8 (FECHAMENTO): fechamento real (26-30 palavras)
- Slide 9 (CONVITE): CTA que direciona para algo real
Cada bloco deve empurrar o raciocínio adiante — nunca repetir a ideia anterior com outras palavras.
`,

  regraFinal: `
REGRA FINAL: a prioridade é gerar tensão, curiosidade, identidade, clareza e progressão narrativa.
Se estiver correto mas morno, reescrever. Se estiver informativo mas sem fricção, reescrever.
Se parecer algo que qualquer página escreveria, reescrever.
`,
};

function buildBrandsDecoded() {
  return [
    BRANDS_DECODED.editorias,
    BRANDS_DECODED.formula,
    BRANDS_DECODED.padroesHook,
    BRANDS_DECODED.gatilhos,
    BRANDS_DECODED.antiPadroes,
    BRANDS_DECODED.regraFinal,
  ].join('\n');
}

// As 4 editorias fixas da Brand The Code™ + os formatos que as entregam.
// `formato` separa o QUE o post é (editoria) de COMO é entregue (carrossel,
// estático, vídeo) — o calendário gira editorias, o vídeo fica fora dele.
const TIPOS_RR = {
  cultural: {
    id: 'cultural', emoji: '📡', label: 'Cultural / Trend', formato: 'carrossel', editoria: true,
    instrucao: 'Lê um fenômeno, comportamento ou mudança de época e conecta ao mundo de quem tem negócio. Tratar marca, produto ou case como fenômeno cultural, disputa de status, mudança de hábito ou sinal de época — nunca como release. Priorizar os padrões Brasil, fim/crise, geracional, novidade, investigação, contraste e nome próprio.',
  },
  tese: {
    id: 'tese', emoji: '📊', label: 'Tese de Negócio', formato: 'carrossel', editoria: true,
    instrucao: 'Uma afirmação defensável sobre como negócios funcionam, sustentada por mecanismo e âncora concreta. A tese precisa ter stake: alguém tem que poder discordar. Mostrar o mecanismo, não só a conclusão.',
  },
  autoral: {
    id: 'autoral', emoji: '✍️', label: 'Post Autoral (visão de mundo)', formato: 'carrossel', editoria: true,
    instrucao: 'Opinião assumida sobre trabalho, dinheiro, ambição, liderança, cultura empresarial ou tecnologia. Não precisa terminar em dica — pode apenas apresentar uma ideia que faz o empresário parar. É o conteúdo mais incopiável do perfil.',
  },
  oferta: {
    id: 'oferta', emoji: '🎯', label: 'Oferta Direta (com CTA)', formato: 'carrossel', editoria: true,
    instrucao: 'Convida para algo real — diagnóstico, conversa, material, bastidor da Case. Constrói o raciocínio até o convite; o CTA é explícito e específico, nunca insistente. Todo post é uma oferta, mas este assume isso.',
  },
  frase: {
    id: 'frase', emoji: '💬', label: 'Frase de Impacto', formato: 'estatico',
    instrucao: 'Uma verdade concentrada em 2-3 linhas, com tensão real. Precisa funcionar isoladamente, sem contexto.',
  },
  lofi: {
    id: 'lofi', emoji: '🎥', label: 'Lo-Fi (câmera ligada)', formato: 'video',
    instrucao: 'Script para vídeo lo-fi direto ao ponto.',
  },
  video_curto: {
    id: 'video_curto', emoji: '⚡', label: 'Vídeo Curto (até 13s)', formato: 'video',
    instrucao: 'Uma única sacada impactante. Sem introdução. Direto ao ponto.',
  },
  video_medio: {
    id: 'video_medio', emoji: '🎬', label: 'Vídeo Médio (até 1min)', formato: 'video',
    instrucao: 'Gancho (0-5s) → desenvolvimento (5-50s) → conclusão (50-60s).',
  },
};

function getMetodologia() {
  return { metodologia: METODOLOGIA_RR, tipos: TIPOS_RR, isRR: true };
}

function build7PilaresRR() {
  return [
    METODOLOGIA_RR.posicionamento,
    METODOLOGIA_RR.storytelling,
    METODOLOGIA_RR.audienciaComunidade,
    METODOLOGIA_RR.ramificacoes,
    METODOLOGIA_RR.escadaCompromisso,
    METODOLOGIA_RR.concordes,
    METODOLOGIA_RR.produtoEMentalidade,
  ].join('\n');
}

function buildSystemPromptCarrossel(profile) {
  const brand   = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;
  const account = getAccount(profile);
  const manualNote = getManualText(profile);

  return `Você é o gerador de conteúdo da ${account.name} — marca pessoal seguindo a Metodologia RR (Bolha RR, 7 pilares).

${METODOLOGIA_RR.filosofia}
${build7PilaresRR()}
${METODOLOGIA_RR.estruturaViral}
${brand.copyDNA || ''}
${manualNote ? `\nDIRETRIZES DO PERFIL:\n${manualNote}` : ''}

${BRANDS_DECODED.contratoCapa}
${BRANDS_DECODED.estruturaCarrossel}
${BRANDS_DECODED.padroesHook}
${BRANDS_DECODED.gatilhos}
${BRANDS_DECODED.antiPadroes}
${BRANDS_DECODED.anotacoes}
${BRANDS_DECODED.copy}

REGRAS OBRIGATÓRIAS:
- Antes de escrever, escolha internamente qual das 6 funções do Pilar 4 (Ramificações) esta peça cumpre, e construa o conteúdo em torno dela.
- O CTA final (se houver) deve seguir o Pilar 5 (permissão, triagem ou filtro) — nunca insistente ou de venda direta.
- CONTAR AS PALAVRAS do hook e do subhook da capa antes de entregar. Fora da faixa, reescrever.
- Retornar APENAS JSON valido, sem markdown. O array "slides" DEVE ter entre 7 e 10 objetos. Cada slide DEVE ter "textos" como array
- NUNCA usar travessão (—) nem hífen no meio de frases
- NUNCA usar: ${METODOLOGIA_RR.tonsProibidos.join(', ')}
- Máximo 4 hashtags na legenda
- Tom: ${METODOLOGIA_RR.tonsPermitidos.join(', ')}
${BRANDS_DECODED.regraFinal}`;
}

function buildSystemPromptContentMachine(profile, tipo) {
  const brand   = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;
  const account = getAccount(profile);
  const manualNote = getManualText(profile);
  const tipoInfo = TIPOS_RR[tipo] || TIPOS_RR.autoral;

  return `Você é o gerador de conteúdo da ${account.name} — marca pessoal, Metodologia RR (Bolha RR, 7 pilares).

${METODOLOGIA_RR.filosofia}
${build7PilaresRR()}
${brand.copyDNA || ''}
${manualNote ? `\nDIRETRIZES DO PERFIL:\n${manualNote}` : ''}

${BRANDS_DECODED.editorias}
${tipoInfo.editoria ? BRANDS_DECODED.contratoCapa + '\n' + BRANDS_DECODED.estruturaCarrossel : ''}
${BRANDS_DECODED.padroesHook}
${BRANDS_DECODED.gatilhos}
${BRANDS_DECODED.antiPadroes}
${BRANDS_DECODED.anotacoes}
${BRANDS_DECODED.copy}

EDITORIA / FORMATO ATUAL: ${tipoInfo.emoji} ${tipoInfo.label}
INSTRUÇÃO ESPECÍFICA: ${tipoInfo.instrucao}

REGRAS:
- Antes de escrever, escolha internamente qual das 6 funções do Pilar 4 (Ramificações) esta peça cumpre.
- O CTA (se houver) segue o Pilar 5 (permissão, triagem ou filtro) — nunca insistente.
- CONTAR AS PALAVRAS do hook e do subhook da capa antes de entregar. Fora da faixa, reescrever.
- NUNCA usar: ${METODOLOGIA_RR.tonsProibidos.join(', ')}
- Tom: ${METODOLOGIA_RR.tonsPermitidos.join(', ')}
- Retornar APENAS JSON valido, sem markdown. O array "slides" DEVE ter entre 7 e 10 objetos. Cada slide DEVE ter "textos" como array
${BRANDS_DECODED.regraFinal}`;
}

const TIPOS_VIDEO_RR_SERVER = ['lofi', 'video_curto', 'video_medio'];

// Formatos que o calendário editorial pode agendar. Vídeo fica de fora: a
// gravação depende de disponibilidade, então entra pela aba "Criar conteúdo"
// quando der, não como compromisso no calendário.
function getTiposCalendario() {
  return Object.values(TIPOS_RR).filter(t => !TIPOS_VIDEO_RR_SERVER.includes(t.id));
}
function isTipoVideo(tipo) {
  return TIPOS_VIDEO_RR_SERVER.includes(String(tipo || '').toLowerCase());
}

function buildPromptRoteiro(tipo, tema, account, tipoInfo, manualNote, brand) {
  const estruturas = { lofi: 'ESTRUTURA LO-FI: GANCHO (0-3s, com 1-2 concordes) → DESENVOLVIMENTO (cumpre uma função do Pilar 4) → CONCLUSÃO/TESE → CTA (Pilar 5: permissão, triagem ou filtro)', video_curto: 'ESTRUTURA VÍDEO CURTO (até 13s): UMA ÚNICA SACADA. Máximo 2-3 frases.', video_medio: 'ESTRUTURA VÍDEO MÉDIO (até 60s): GANCHO (0-5s, com concordes) → DESENVOLVIMENTO (5-50s) → CONCLUSÃO + CTA (50-60s, Pilar 5)' };
  const systemPrompt = 'Você é roteirista de conteúdo para Instagram da ' + account.name + ' — marca pessoal, Metodologia RR (Bolha RR, 7 pilares).\n\n' + METODOLOGIA_RR.filosofia + '\n' + build7PilaresRR() + '\nNUNCA usar: ' + METODOLOGIA_RR.tonsProibidos.join(', ') + '.\n' + (brand.copyDNA || '') + '\n' + (manualNote ? '\nDIRETRIZES DO PERFIL:\n' + manualNote + '\n' : '') + '\nTIPO: ' + tipoInfo.emoji + ' ' + tipoInfo.label + '\n' + (estruturas[tipo] || '') + '\n\nRetornar APENAS JSON valido, sem markdown.';
  const userPrompt = 'Perfil: ' + account.name + ' (' + account.handle + ')\nTema: "' + tema + '"\nTipo: ' + tipoInfo.label + '\n\nEscolha qual função do Pilar 4 (Ramificações) este roteiro cumpre e escreva o CTA seguindo o Pilar 5 (permissão, triagem ou filtro — nunca insistente).\n\nJSON:\n{"tipo":"' + tipo + '","tipo_label":"' + tipoInfo.label + '","tema":"' + tema + '","isRoteiro":true,"duracao_estimada":"ex: 45-55 segundos","gancho":"primeira frase exata a ser dita na câmera","blocos":[{"id":1,"label":"GANCHO","tempo":"0-5s","texto":"...","nota_direcao":"..."},{"id":2,"label":"DESENVOLVIMENTO","tempo":"5-40s","texto":"...","nota_direcao":"..."},{"id":3,"label":"CONCLUSÃO","tempo":"40-55s","texto":"...","nota_direcao":"..."},{"id":4,"label":"CTA","tempo":"55-60s","texto":"...","nota_direcao":"falar com intimidade"}],"dicas_gravacao":["dica específica"],"legenda_sugerida":"legenda com emojis, máximo 4 hashtags"}';
  return { systemPrompt, userPrompt };
}

module.exports = {
  METODOLOGIA_RR,
  BRANDS_DECODED,
  buildBrandsDecoded,
  TIPOS_RR,
  getMetodologia,
  build7PilaresRR,
  buildSystemPromptCarrossel,
  buildSystemPromptContentMachine,
  TIPOS_VIDEO_RR_SERVER,
  getTiposCalendario,
  isTipoVideo,
  buildPromptRoteiro,
};
