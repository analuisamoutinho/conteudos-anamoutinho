const fs     = require('fs');
const path   = require('path');
const multer = require('multer');
const { PHOTOS_FILE, PHOTOS_DIR, UPLOADS_DIR } = require('../config');
const { readJSON, writeJSON } = require('./jsonStore');
const { supabase } = require('./supabase');

// ── Banco de fotos ────────────────────────────────────────────────────────
// Persistência: Supabase Storage (bucket 'photos') + tabela 'photos_meta'
// Fallback: disco local /tmp/photos (Railway efêmero — apenas durante sessão)

// Salva foto no Supabase Storage e retorna URL pública
async function savePhotoToStorage(buffer, filename, mimetype) {
  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from('photos')
        .upload(filename, buffer, { contentType: mimetype || 'image/jpeg', upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('photos').getPublicUrl(filename);
        if (data?.publicUrl) return { url: data.publicUrl, storage: 'supabase' };
      }
    } catch(e) { console.warn('[photos] Supabase Storage:', e.message); }
  }
  // Fallback: disco local
  const fp = path.join(PHOTOS_DIR, filename);
  fs.writeFileSync(fp, buffer);
  return { url: null, storage: 'local' };
}

// Lê metadados das fotos — Supabase primeiro, fallback JSON local
async function loadPhotosMeta(profile) {
  if (supabase) {
    try {
      let q = supabase.from('photos_meta').select('*').order('uploaded_at', { ascending: false });
      if (profile) q = q.eq('profile', profile);
      const { data, error } = await q;
      if (!error && data?.length) return data.map(r => ({
        id: r.id, profile: r.profile, filename: r.filename,
        originalName: r.original_name, tags: r.tags || [],
        description: r.description || '', uploadedAt: r.uploaded_at,
        publicUrl: r.public_url || null,
      }));
    } catch(e) { console.warn('[photos] loadPhotosMeta Supabase:', e.message); }
  }
  const all = readJSON(PHOTOS_FILE);
  return profile ? all.filter(p => p.profile === profile) : all;
}

async function savePhotoMeta(meta) {
  // Salva local
  const all = readJSON(PHOTOS_FILE);
  all.unshift(meta);
  writeJSON(PHOTOS_FILE, all);
  // Salva no Supabase
  if (supabase) {
    supabase.from('photos_meta').upsert({
      id: meta.id, profile: meta.profile, filename: meta.filename,
      original_name: meta.originalName, tags: meta.tags || [],
      description: meta.description || '', uploaded_at: meta.uploadedAt,
      public_url: meta.publicUrl || null,
      data_url: meta.dataUrl || null,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[photos] upsert:', error.message);
    });
  }
}

const photoUpload = multer({
  dest: path.join(UPLOADS_DIR, 'photos') + '/',
  fileFilter: (req, file, cb) => { if (file.mimetype.startsWith('image/')) cb(null, true); else cb(new Error('Apenas imagens')); },
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = { savePhotoToStorage, loadPhotosMeta, savePhotoMeta, photoUpload };
