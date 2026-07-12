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
- Repetição é poder: não tenha medo de retomar os mesmos temas centrais (ordem, virtude, corrida, leitura, alicerce) de ângulos diferentes.
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
  tiposConteudo: ['lofi', 'carrossel', 'video_curto', 'video_medio', 'frase', 'dump', 'bastidores'],
};

const TIPOS_RR = {
  lofi: { id: 'lofi', emoji: '🎥', label: 'Lo-Fi (câmera ligada)', instrucao: 'Script para vídeo lo-fi direto ao ponto.' },
  carrossel: { id: 'carrossel', emoji: '📋', label: 'Carrossel', instrucao: 'Slide 1: gancho provocativo. Slides do meio: profundidade real. Slide final: conclusão + CTA leve.' },
  video_curto: { id: 'video_curto', emoji: '⚡', label: 'Vídeo Curto (até 13s)', instrucao: 'Uma única sacada impactante. Sem introdução. Direto ao ponto.' },
  video_medio: { id: 'video_medio', emoji: '🎬', label: 'Vídeo Médio (até 1min)', instrucao: 'Gancho (0-5s) → desenvolvimento (5-50s) → conclusão (50-60s).' },
  frase: { id: 'frase', emoji: '✍️', label: 'Frase de Impacto', instrucao: 'Uma verdade concentrada em 2-3 linhas.' },
  dump: { id: 'dump', emoji: '📸', label: 'Dump / Bastidores', instrucao: 'Momentos reais com narrativa.' },
  bastidores: { id: 'bastidores', emoji: '🎬', label: 'Bastidores', instrucao: 'Mostra o processo real, não o resultado polido.' },
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

REGRAS OBRIGATÓRIAS:
- Antes de escrever, escolha internamente qual das 6 funções do Pilar 4 (Ramificações) esta peça cumpre, e construa o conteúdo em torno dela.
- O CTA final (se houver) deve seguir o Pilar 5 (permissão, triagem ou filtro) — nunca insistente ou de venda direta.
- Retornar APENAS JSON valido, sem markdown. O array "slides" DEVE ter entre 7 e 10 objetos. Cada slide DEVE ter "textos" como array
- NUNCA usar travessão (—) nem hífen no meio de frases
- NUNCA usar: ${METODOLOGIA_RR.tonsProibidos.join(', ')}
- Máximo 4 hashtags na legenda
- Tom: ${METODOLOGIA_RR.tonsPermitidos.join(', ')}`;
}

function buildSystemPromptContentMachine(profile, tipo) {
  const brand   = BRAND_IDENTITIES[profile] || BRAND_IDENTITIES.pessoal;
  const account = getAccount(profile);
  const manualNote = getManualText(profile);
  const tipoInfo = TIPOS_RR[tipo] || TIPOS_RR.carrossel;

  return `Você é o gerador de conteúdo da ${account.name} — marca pessoal, Metodologia RR (Bolha RR, 7 pilares).

${METODOLOGIA_RR.filosofia}
${build7PilaresRR()}
${brand.copyDNA || ''}
${manualNote ? `\nDIRETRIZES DO PERFIL:\n${manualNote}` : ''}

FORMATO ATUAL: ${tipoInfo.emoji} ${tipoInfo.label}
INSTRUÇÃO ESPECÍFICA: ${tipoInfo.instrucao}

REGRAS:
- Antes de escrever, escolha internamente qual das 6 funções do Pilar 4 (Ramificações) esta peça cumpre.
- O CTA (se houver) segue o Pilar 5 (permissão, triagem ou filtro) — nunca insistente.
- NUNCA usar: ${METODOLOGIA_RR.tonsProibidos.join(', ')}
- Tom: ${METODOLOGIA_RR.tonsPermitidos.join(', ')}
- Retornar APENAS JSON valido, sem markdown. O array "slides" DEVE ter entre 7 e 10 objetos. Cada slide DEVE ter "textos" como array`;
}

const TIPOS_VIDEO_RR_SERVER = ['lofi', 'video_curto', 'video_medio'];

function buildPromptRoteiro(tipo, tema, account, tipoInfo, manualNote, brand) {
  const estruturas = { lofi: 'ESTRUTURA LO-FI: GANCHO (0-3s, com 1-2 concordes) → DESENVOLVIMENTO (cumpre uma função do Pilar 4) → CONCLUSÃO/TESE → CTA (Pilar 5: permissão, triagem ou filtro)', video_curto: 'ESTRUTURA VÍDEO CURTO (até 13s): UMA ÚNICA SACADA. Máximo 2-3 frases.', video_medio: 'ESTRUTURA VÍDEO MÉDIO (até 60s): GANCHO (0-5s, com concordes) → DESENVOLVIMENTO (5-50s) → CONCLUSÃO + CTA (50-60s, Pilar 5)' };
  const systemPrompt = 'Você é roteirista de conteúdo para Instagram da ' + account.name + ' — marca pessoal, Metodologia RR (Bolha RR, 7 pilares).\n\n' + METODOLOGIA_RR.filosofia + '\n' + build7PilaresRR() + '\nNUNCA usar: ' + METODOLOGIA_RR.tonsProibidos.join(', ') + '.\n' + (brand.copyDNA || '') + '\n' + (manualNote ? '\nDIRETRIZES DO PERFIL:\n' + manualNote + '\n' : '') + '\nTIPO: ' + tipoInfo.emoji + ' ' + tipoInfo.label + '\n' + (estruturas[tipo] || '') + '\n\nRetornar APENAS JSON valido, sem markdown.';
  const userPrompt = 'Perfil: ' + account.name + ' (' + account.handle + ')\nTema: "' + tema + '"\nTipo: ' + tipoInfo.label + '\n\nEscolha qual função do Pilar 4 (Ramificações) este roteiro cumpre e escreva o CTA seguindo o Pilar 5 (permissão, triagem ou filtro — nunca insistente).\n\nJSON:\n{"tipo":"' + tipo + '","tipo_label":"' + tipoInfo.label + '","tema":"' + tema + '","isRoteiro":true,"duracao_estimada":"ex: 45-55 segundos","gancho":"primeira frase exata a ser dita na câmera","blocos":[{"id":1,"label":"GANCHO","tempo":"0-5s","texto":"...","nota_direcao":"..."},{"id":2,"label":"DESENVOLVIMENTO","tempo":"5-40s","texto":"...","nota_direcao":"..."},{"id":3,"label":"CONCLUSÃO","tempo":"40-55s","texto":"...","nota_direcao":"..."},{"id":4,"label":"CTA","tempo":"55-60s","texto":"...","nota_direcao":"falar com intimidade"}],"dicas_gravacao":["dica específica"],"legenda_sugerida":"legenda com emojis, máximo 4 hashtags"}';
  return { systemPrompt, userPrompt };
}

module.exports = {
  METODOLOGIA_RR,
  TIPOS_RR,
  getMetodologia,
  build7PilaresRR,
  buildSystemPromptCarrossel,
  buildSystemPromptContentMachine,
  TIPOS_VIDEO_RR_SERVER,
  buildPromptRoteiro,
};
