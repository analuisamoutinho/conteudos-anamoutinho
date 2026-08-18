const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { askOpenAI, MODEL_FAST } = require('./ai');

// ═══════════════════════════════════════════════════════════════════════════
// TENDÊNCIAS — Google Trends BR + Reddit BR + Google News BR
// ═══════════════════════════════════════════════════════════════════════════

const trendsCache = {};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';

// Subreddits brasileiros onde o público de donos de negócio realmente conversa
const REDDIT_SUBS = ['empreendedorismo', 'brasil', 'investimentos', 'MarketingBrasil', 'brasilivre'];

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .trim();
}

function parseGoogleTrendsRSS(xml) {
  const items = []; const itemRx = /<item>([\s\S]*?)<\/item>/g; let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1]; const title = (/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(block) || /<title>([\s\S]*?)<\/title>/.exec(block) || [])[1] || ''; const traffic = (/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/.exec(block) || [])[1] || '';
    const t = decodeEntities(title); if (t) items.push({ termo: t, volume: traffic.trim(), fonte: 'Google Trends' });
  }
  return items;
}

async function getGoogleTrends() {
  try {
    const r = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR', { headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml,*/*', 'Accept-Language': 'pt-BR,pt;q=0.9' }, signal: AbortSignal.timeout(12000) });
    if (r.ok) { const xml = await r.text(); const items = parseGoogleTrendsRSS(xml); if (items.length > 0) return items.slice(0, 20); }
  } catch(e) { console.warn('[Trends] Google RSS failed:', e.message); }
  return [];
}

// ── Reddit BR ─────────────────────────────────────────────────────────────
// Assuntos que estão bombando nas comunidades brasileiras de negócios.
// Vantagem sobre o Google Trends: aqui aparece a dor crua, escrita pela
// própria pessoa — matéria-prima direta para gancho de conteúdo.
async function getRedditTrends(limit = 20) {
  const results = [];
  await Promise.all(REDDIT_SUBS.map(async (sub) => {
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=12&raw_json=1`, {
        headers: { 'User-Agent': 'maquina-criativos/1.0 (trend research)', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok) return;
      const data = await r.json();
      for (const child of (data?.data?.children || [])) {
        const p = child.data || {};
        if (p.stickied || p.over_18 || !p.title) continue;
        results.push({
          termo: decodeEntities(p.title).slice(0, 180),
          volume: `${p.score || 0} upvotes · ${p.num_comments || 0} comentários · r/${sub}`,
          score: p.score || 0,
          fonte: 'Reddit BR',
        });
      }
    } catch(e) { console.warn(`[Trends] Reddit r/${sub} failed:`, e.message); }
  }));
  return results.sort((a, b) => b.score - a.score).slice(0, limit).map(({ score, ...rest }) => rest);
}

// ── Google News BR (economia & negócios) ──────────────────────────────────
// Manchetes do dia no Brasil — contexto de mercado que o empresário já viu
// no feed e sobre o qual espera uma leitura.
function parseNewsRSS(xml, fonte) {
  const items = []; const itemRx = /<item>([\s\S]*?)<\/item>/g; let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1];
    const title  = (/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(block) || /<title>([\s\S]*?)<\/title>/.exec(block) || [])[1] || '';
    const source = (/<source[^>]*>([\s\S]*?)<\/source>/.exec(block) || [])[1] || '';
    const t = decodeEntities(title);
    if (t) items.push({ termo: t.replace(/\s+-\s+[^-]+$/, '').slice(0, 180), volume: decodeEntities(source), fonte });
  }
  return items;
}

async function getGoogleNewsBR(limit = 15) {
  const feeds = [
    { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=pt-BR&gl=BR&ceid=BR:pt-419', fonte: 'Google News BR' },
    { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=pt-BR&gl=BR&ceid=BR:pt-419', fonte: 'Google News BR' },
  ];
  const out = [];
  await Promise.all(feeds.map(async ({ url, fonte }) => {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml,*/*', 'Accept-Language': 'pt-BR,pt;q=0.9' }, signal: AbortSignal.timeout(12000) });
      if (!r.ok) return;
      out.push(...parseNewsRSS(await r.text(), fonte));
    } catch(e) { console.warn('[Trends] Google News failed:', e.message); }
  }));
  return out.slice(0, limit);
}

// ── Fallback IA ───────────────────────────────────────────────────────────
async function getAITrends() {
  try {
    const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const txt = await askOpenAI({
      prompt: 'Liste 15 assuntos muito comentados no Brasil em ' + month + ' por donos de negócio e empresários. Variedade: economia, gestão, vendas, marketing, tecnologia, IA, mercado de trabalho, comportamento empresarial. Responda SOMENTE JSON no formato {"itens":[{"termo":"nome","volume":"tendencia","fonte":"Estimativa IA"}]}',
      model: MODEL_FAST, maxTokens: 900, json: true,
    });
    const parsed = JSON.parse(txt);
    const arr = Array.isArray(parsed) ? parsed : (parsed.itens || parsed.trends || []);
    return arr.slice(0, 15);
  } catch(e) { console.warn('[Trends] AI fallback failed:', e.message); }
  return [];
}

// ── Agregador ─────────────────────────────────────────────────────────────
async function getAllTrends() {
  const [google, reddit, news] = await Promise.all([
    getGoogleTrends(),
    getRedditTrends(),
    getGoogleNewsBR(),
  ]);

  let items = [...google, ...reddit, ...news];
  const fontes = { google: google.length > 0, reddit: reddit.length > 0, news: news.length > 0, ia: false };

  if (!items.length) {
    items = await getAITrends();
    fontes.ia = items.length > 0;
  }

  // dedupe por termo normalizado
  const seen = new Set();
  const unique = items.filter(it => {
    const k = it.termo.toLowerCase().replace(/[^a-z0-9á-ú ]/gi, '').trim();
    if (!k || seen.has(k)) return false;
    seen.add(k); return true;
  });

  return { items: unique, fontes };
}

module.exports = { parseGoogleTrendsRSS, parseNewsRSS, getGoogleTrends, getRedditTrends, getGoogleNewsBR, getAllTrends, trendsCache };
