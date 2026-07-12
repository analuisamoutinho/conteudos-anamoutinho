const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// ═══════════════════════════════════════════════════════════════════════════
// TENDÊNCIAS
// ═══════════════════════════════════════════════════════════════════════════

const trendsCache = {};

function parseGoogleTrendsRSS(xml) {
  const items = []; const itemRx = /<item>([\s\S]*?)<\/item>/g; let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1]; const title = (/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(block) || /<title>([\s\S]*?)<\/title>/.exec(block) || [])[1] || ''; const traffic = (/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/.exec(block) || [])[1] || '';
    const t = title.replace(/&amp;/g,'&').replace(/&#39;/g,"'").trim(); if (t) items.push({ termo: t, volume: traffic.trim(), fonte: 'Google Trends' });
  }
  return items;
}

async function getGoogleTrends() {
  try {
    const r = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36', 'Accept': 'application/rss+xml,*/*', 'Accept-Language': 'pt-BR,pt;q=0.9' }, signal: AbortSignal.timeout(12000) });
    if (r.ok) { const xml = await r.text(); const items = parseGoogleTrendsRSS(xml); if (items.length > 0) return items.slice(0, 20); }
  } catch(e) { console.warn('[Trends] RSS failed:', e.message); }
  try {
    const month = new Date().toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 900, messages: [{ role: 'user', content: 'Liste 15 assuntos muito comentados no Brasil em ' + month + '. Variedade: entretenimento, esportes, politica, economia, tecnologia, comportamento. SOMENTE JSON array: [{"termo":"nome","volume":"tendencia","fonte":"Estimativa IA"}]' }] }) });
    const aiData = await aiRes.json();
    if (aiData.content?.[0]) { const txt = aiData.content[0].text.trim(); const m2 = txt.match(/\[[\s\S]+\]/); if (m2) return JSON.parse(m2[0]).slice(0, 15); }
  } catch(e2) { console.warn('[Trends] Fallback failed:', e2.message); }
  return [];
}

module.exports = { parseGoogleTrendsRSS, getGoogleTrends, trendsCache };
