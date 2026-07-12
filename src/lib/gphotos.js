const fs     = require('fs');
const path   = require('path');
const fetch  = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { DATA_DIR } = require('../config');
const { supabase } = require('./supabase');

// ── Google Photos ─────────────────────────────────────────────────────────
// Tokens persistidos no Supabase (tabela oauth_tokens) — não somem no Railway

async function loadGPhotoTokens() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('oauth_tokens').select('*').eq('service', 'gphotos');
      if (!error && data?.length) {
        const result = {};
        data.forEach(r => { result[r.user_id] = { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: r.expires_at ? new Date(r.expires_at).getTime() : 0, connected_at: r.connected_at }; });
        return result;
      }
    } catch(e) { console.warn('[gphotos] loadTokens Supabase:', e.message); }
  }
  // Fallback local
  try {
    const fp = path.join(DATA_DIR, 'gphotos_tokens.json');
    if (!fs.existsSync(fp)) return {};
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch(e) { return {}; }
}

async function saveGPhotoToken(userId, tokenData) {
  // Salva local
  try {
    const fp = path.join(DATA_DIR, 'gphotos_tokens.json');
    const all = (() => { try { return JSON.parse(fs.readFileSync(fp,'utf8')); } catch(e) { return {}; } })();
    all[userId] = tokenData;
    fs.writeFileSync(fp, JSON.stringify(all, null, 2));
  } catch(e) {}
  // Salva no Supabase
  if (supabase) {
    try {
      await supabase.from('oauth_tokens').upsert({
        user_id: userId, service: 'gphotos',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
        connected_at: tokenData.connected_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,service' });
    } catch(e) { console.warn('[gphotos] saveToken Supabase:', e.message); }
  }
}

async function deleteGPhotoToken(userId) {
  try {
    const fp = path.join(DATA_DIR, 'gphotos_tokens.json');
    const all = (() => { try { return JSON.parse(fs.readFileSync(fp,'utf8')); } catch(e) { return {}; } })();
    delete all[userId];
    fs.writeFileSync(fp, JSON.stringify(all, null, 2));
  } catch(e) {}
  if (supabase) {
    try { await supabase.from('oauth_tokens').delete().eq('user_id', userId).eq('service', 'gphotos'); } catch(e) {}
  }
}

async function refreshGPhotoToken(userId) {
  const tokens = await loadGPhotoTokens();
  const userTokens = tokens[userId];
  if (!userTokens?.refresh_token) return null;
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: userTokens.refresh_token, grant_type: 'refresh_token' }).toString()
    });
    const d = await r.json();
    if (d.access_token) {
      const updated = { ...userTokens, access_token: d.access_token, expires_at: Date.now() + (d.expires_in * 1000) };
      await saveGPhotoToken(userId, updated);
      return d.access_token;
    }
    console.warn('[gphotos] refresh falhou:', JSON.stringify(d));
    return null;
  } catch(e) { console.error('[gphotos] refresh error:', e.message); return null; }
}

async function getGPhotoAccessToken(userId) {
  const tokens = await loadGPhotoTokens();
  const t = tokens[userId];
  if (!t) return null;
  if (t.expires_at && Date.now() < t.expires_at - 60000) return t.access_token;
  return await refreshGPhotoToken(userId);
}

module.exports = { loadGPhotoTokens, saveGPhotoToken, deleteGPhotoToken, refreshGPhotoToken, getGPhotoAccessToken };
