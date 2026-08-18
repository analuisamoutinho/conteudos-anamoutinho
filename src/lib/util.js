function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return JSON.parse(cleaned);
}

function normalizeDays(parsed) {
  let days = parsed.days || parsed.calendar || parsed.data || (Array.isArray(parsed) ? parsed : null);
  if (!days) {
    const keys = Object.keys(parsed);
    for (const k of keys) {
      if (Array.isArray(parsed[k]) && parsed[k].length > 0 && parsed[k][0].day !== undefined) {
        days = parsed[k]; break;
      }
    }
  }
  return days || [];
}

// ── Chaves de API ─────────────────────────────────────────────────────────
// Sem esta guarda o erro que chega ao ecrã é "invalid api key", devolvido pela
// OpenAI — o que não diz a quem lê que a variável simplesmente não foi
// configurada no ambiente do deploy.
function requireOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error('OPENAI_API_KEY não está configurada neste deploy. Adiciona a variável de ambiente (chave da OpenAI, começa por sk-) e faz um novo deploy.');
  }
  return key;
}

module.exports = { extractJSON, normalizeDays, requireOpenAIKey };
