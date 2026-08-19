const fs = require('fs');
const { USER_SETTINGS_FILE } = require('../config');

// ── Quality helpers ───────────────────────────────────────────────────────
// CORRIGIDO: adicionado 'high' e 'auto' que a gpt-image-1 aceita
const VALID_QUALITIES = ['low', 'medium', 'high', 'auto'];
const DEFAULT_QUALITY = 'high';
function resolveQuality(q) { return VALID_QUALITIES.includes(q) ? q : DEFAULT_QUALITY; }

// ── User Settings ─────────────────────────────────────────────────────────
function loadUserSettings() {
  try {
    if (!fs.existsSync(USER_SETTINGS_FILE)) {
      const def = { image_quality: DEFAULT_QUALITY };
      fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify(def, null, 2));
      return def;
    }
    return JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, 'utf-8'));
  } catch(e) { return { image_quality: DEFAULT_QUALITY }; }
}
function saveUserSettings(settings) {
  try {
    const merged = { ...loadUserSettings(), ...settings };
    fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify(merged, null, 2));
    return merged;
  } catch(e) { console.error('saveUserSettings:', e.message); return settings; }
}

// ── Ritmo do feed ─────────────────────────────────────────────────────────
// Os posts alternam entre duas variações da MESMA identidade, para o grid do
// perfil formar um xadrez: um post abre em papel claro, o seguinte abre em
// bloco vermelho. O contador vive nas definições para sobreviver entre posts.
const VARIACOES_FEED = ['A', 'B'];
function proximaVariacaoFeed() {
  const s = loadUserSettings();
  const i = Number.isInteger(s.feedVariacaoIndex) ? s.feedVariacaoIndex : 0;
  saveUserSettings({ feedVariacaoIndex: (i + 1) % VARIACOES_FEED.length });
  return VARIACOES_FEED[i % VARIACOES_FEED.length];
}

module.exports = { loadUserSettings, saveUserSettings, VALID_QUALITIES, DEFAULT_QUALITY, resolveQuality, VARIACOES_FEED, proximaVariacaoFeed };
