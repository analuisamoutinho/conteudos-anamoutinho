const fs   = require('fs');
const path = require('path');

const DATA_DIR       = fs.existsSync('/tmp') ? '/tmp' : '.';
const UPLOADS_DIR    = path.join(DATA_DIR, 'uploads');
const SCHEDULED_FILE = path.join(DATA_DIR, 'scheduled_posts.json');
const GENERATED_FILE = path.join(DATA_DIR, 'generated_content.json');
const CALENDAR_FILE  = path.join(DATA_DIR, 'calendar_data.json');
const MANUALS_DIR    = path.join(DATA_DIR, 'manuals');
const IMAGES_DIR     = path.join(DATA_DIR, 'carousel_images');
const PROFILES_FILE  = path.join(DATA_DIR, 'profiles_manual.json');
const USER_SETTINGS_FILE  = path.join(DATA_DIR, 'user_settings.json');

try { fs.mkdirSync(UPLOADS_DIR,                          { recursive: true }); } catch(e) {}
try { fs.mkdirSync(MANUALS_DIR,                          { recursive: true }); } catch(e) {}
try { fs.mkdirSync(IMAGES_DIR,                           { recursive: true }); } catch(e) {}
try { fs.mkdirSync(path.join(UPLOADS_DIR, 'photos'),     { recursive: true }); } catch(e) {}

// ── Banco de fotos ────────────────────────────────────────────────────────
const PHOTOS_FILE = path.join(DATA_DIR, 'photos_meta.json');
const PHOTOS_DIR  = path.join(DATA_DIR, 'photos');
try { fs.mkdirSync(PHOTOS_DIR, { recursive: true }); } catch(e) {}
if (!fs.existsSync(PHOTOS_FILE)) fs.writeFileSync(PHOTOS_FILE, '[]');

// ── Canva templates ───────────────────────────────────────────────────────
const CANVA_TEMPLATES_FILE = '/tmp/canva_templates.json';

// ── Tendências ────────────────────────────────────────────────────────────
const NICHE_CONFIG = { pessoal: 'marketing que gera negócio, decisões empresariais, gestão, liderança, vendas, processos, equipe, dinheiro, tecnologia e IA — para donos de negócio que já faturam e querem crescer sem depender apenas do próprio esforço' };
const TRENDS_TTL   = 60 * 60 * 1000;

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  SCHEDULED_FILE,
  GENERATED_FILE,
  CALENDAR_FILE,
  MANUALS_DIR,
  IMAGES_DIR,
  PROFILES_FILE,
  USER_SETTINGS_FILE,
  PHOTOS_FILE,
  PHOTOS_DIR,
  CANVA_TEMPLATES_FILE,
  NICHE_CONFIG,
  TRENDS_TTL,
};
