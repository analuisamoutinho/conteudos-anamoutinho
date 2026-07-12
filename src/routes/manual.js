const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();
const { UPLOADS_DIR, MANUALS_DIR } = require('../config');
const { loadProfiles, saveProfiles } = require('../lib/profiles');

const upload = multer({ dest: UPLOADS_DIR + '/' });

// ── Manual upload ─────────────────────────────────────────────────────────
router.post('/api/manual/upload', upload.single('pdf'), (req, res) => {
  const { profile } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  const dest = path.join(MANUALS_DIR, `${profile || 'pessoal'}.pdf`);
  fs.renameSync(req.file.path, dest);
  const profiles = loadProfiles();
  if (profiles[profile]) {
    profiles[profile].pdfUploadedAt = new Date().toISOString();
    saveProfiles(profiles);
  }
  res.json({ success: true, message: `Manual do perfil "${profile}" guardado.` });
});

module.exports = router;
