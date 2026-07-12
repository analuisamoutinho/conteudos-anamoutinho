const express = require('express');
const router = express.Router();
const { loadUserSettings, saveUserSettings, VALID_QUALITIES } = require('../lib/userSettings');

router.get('/api/user-settings', (req, res) => { res.json(loadUserSettings()); });
router.patch('/api/user-settings', (req, res) => {
  try {
    const updates = {};
    if (req.body.image_quality !== undefined) updates.image_quality = req.body.image_quality;
    if (updates.image_quality && !VALID_QUALITIES.includes(updates.image_quality))
      return res.status(400).json({ error: 'image_quality deve ser: ' + VALID_QUALITIES.join(' | ') });
    res.json({ success: true, settings: saveUserSettings(updates) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
