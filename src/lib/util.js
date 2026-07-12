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

module.exports = { extractJSON, normalizeDays };
