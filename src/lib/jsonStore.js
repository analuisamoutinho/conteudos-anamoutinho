const fs   = require('fs');
const path = require('path');

// ── Helpers JSON ──────────────────────────────────────────────────────────
function ensureFile(file, def = '[]') {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, def, 'utf-8');
  } catch(e) { console.error('ensureFile:', file, e.message); }
}
function readJSON(file) {
  try {
    ensureFile(file);
    const raw = fs.readFileSync(file, 'utf-8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch(e) { console.error('readJSON:', file, e.message); return []; }
}
function writeJSON(file, data) {
  try {
    ensureFile(file);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch(e) { console.error('writeJSON:', file, e.message); }
}

module.exports = { ensureFile, readJSON, writeJSON };
