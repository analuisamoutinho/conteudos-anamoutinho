const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { requireOpenAIKey } = require('./util');

// ═══════════════════════════════════════════════════════════════════════════
// IA — OpenAI (única chave usada pelo projeto: OPENAI_API_KEY)
// ═══════════════════════════════════════════════════════════════════════════
// FAST  → tarefas mecânicas e baratas (escolher IDs, dar match de template)
// SMART → geração criativa (copy, carrossel, calendário, pautas)

const MODEL_FAST  = process.env.OPENAI_MODEL_FAST  || 'gpt-4o-mini';
const MODEL_SMART = process.env.OPENAI_MODEL_SMART || 'gpt-4o';

async function askOpenAI({ prompt, system, model = MODEL_SMART, maxTokens = 2000, temperature = 1.0, json = false }) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const body = { model, messages, max_tokens: maxTokens, temperature };
  // json_object exige que o prompt mencione JSON — todos os nossos pedem.
  if (json) body.response_format = { type: 'json_object' };

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + requireOpenAIKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // A resposta nem sempre é JSON (proxy, 502, rate limit devolvem HTML/texto):
  // ler como texto primeiro evita um "Unexpected token" que esconde a causa real.
  const rawBody = await r.text();
  let d;
  try { d = JSON.parse(rawBody); }
  catch { throw new Error('Resposta inválida da OpenAI (HTTP ' + r.status + '): ' + rawBody.slice(0, 200)); }
  if (d.error) throw new Error('OpenAI: ' + d.error.message);
  if (!r.ok) throw new Error('OpenAI devolveu HTTP ' + r.status);
  const text = d.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('A OpenAI não devolveu conteúdo.');
  return text;
}

module.exports = { askOpenAI, MODEL_FAST, MODEL_SMART };
