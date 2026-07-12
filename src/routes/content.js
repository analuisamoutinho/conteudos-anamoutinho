const express = require('express');
const router  = express.Router();
const { GENERATED_FILE } = require('../config');
const { readJSON, writeJSON } = require('../lib/jsonStore');
const { supabase } = require('../lib/supabase');
const { saveGeneratedContent, updateContentImages, loadGeneratedContent } = require('../lib/content');

// ── Base de conteúdos ─────────────────────────────────────────────────────
router.get('/api/content', async (req, res) => {
  const { profile, type, status } = req.query;
  try {
    let items = await loadGeneratedContent(profile);
    if (type)   items = items.filter(i => i.type   === type);
    if (status) items = items.filter(i => i.status === status);
    res.json(items);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/content/save', (req, res) => {
  const item = { id: 'cnt_' + Date.now(), createdAt: new Date().toISOString(), status: 'pendente', ...req.body };
  saveGeneratedContent(item);
  res.json({ success: true, item });
});

router.patch('/api/content/:id', (req, res) => {
  const all = readJSON(GENERATED_FILE);
  const idx = all.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  all[idx] = { ...all[idx], ...req.body };
  writeJSON(GENERATED_FILE, all);
  if (supabase) {
    const updates = {};
    if (req.body.imageUrls) updates.image_urls = req.body.imageUrls;
    if (req.body.status)    updates.status      = req.body.status;
    if (Object.keys(updates).length) {
      supabase.from('generated_content').update(updates).eq('id', req.params.id)
        .then(({ error }) => { if (error) console.error('Supabase patch:', error.message); });
    }
  }
  res.json({ success: true, item: all[idx] });
});

router.patch('/api/content/:id/images', (req, res) => {
  try {
    const { imageUrls } = req.body;
    if (!Array.isArray(imageUrls)) return res.status(400).json({ error: 'imageUrls deve ser array' });
    updateContentImages(req.params.id, imageUrls);
    res.json({ success: true, savedCount: imageUrls.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/content/:id', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('generated_content').select('*').eq('id', req.params.id).single();
      if (!error && data) {
        return res.json({ id: data.id, profile: data.profile, type: data.type, status: data.status, topic: data.topic, caption: data.caption, hashtags: data.hashtags, carouselData: data.carousel_data ? JSON.parse(data.carousel_data) : null, contentMachineType: data.content_machine_type, createdAt: data.created_at, imageUrls: data.image_urls || [] });
      }
    }
    const all  = readJSON(GENERATED_FILE);
    const item = all.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
