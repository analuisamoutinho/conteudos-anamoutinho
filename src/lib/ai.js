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

// ── Geração de imagem ─────────────────────────────────────────────────────
// gpt-image-2 é o modelo atual; mantém-se o 1 como fallback automático para o
// caso de a conta ainda não ter acesso ao 2 (a API responde model_not_found).
const IMAGE_MODEL          = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const IMAGE_MODEL_FALLBACK = process.env.OPENAI_IMAGE_MODEL_FALLBACK || 'gpt-image-1';

async function callImagesAPI(model, { prompt, size, quality }) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + requireOpenAIKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, n: 1, size, quality, output_format: 'png' }),
  });
  const rawBody = await r.text();
  let d;
  try { d = JSON.parse(rawBody); }
  catch { throw new Error('Resposta inválida da OpenAI (HTTP ' + r.status + '): ' + rawBody.slice(0, 200)); }
  return d;
}

function isModelUnavailable(err) {
  const msg = (err?.message || '') + ' ' + (err?.code || '') + ' ' + (err?.type || '');
  return /model_not_found|does not exist|do not have access|unsupported.*model|invalid.*model/i.test(msg);
}

async function generateImage({ prompt, size = '1024x1536', quality = 'high' }) {
  let d = await callImagesAPI(IMAGE_MODEL, { prompt, size, quality });
  if (d.error && isModelUnavailable(d.error) && IMAGE_MODEL_FALLBACK !== IMAGE_MODEL) {
    console.warn('[ai] ' + IMAGE_MODEL + ' indisponível (' + d.error.message + '), a usar ' + IMAGE_MODEL_FALLBACK);
    d = await callImagesAPI(IMAGE_MODEL_FALLBACK, { prompt, size, quality });
  }
  if (d.error) throw new Error('OpenAI: ' + d.error.message);
  const image = d.data && d.data[0];
  if (!image) throw new Error('A OpenAI não devolveu imagem.');
  return { b64: image.b64_json || null, url: image.url || null };
}

module.exports = { askOpenAI, generateImage, MODEL_FAST, MODEL_SMART, IMAGE_MODEL };
