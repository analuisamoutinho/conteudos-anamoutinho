const express = require('express');
const fs      = require('fs');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const router  = express.Router();
const { PHOTOS_FILE, PHOTOS_DIR } = require('../config');
const { readJSON, writeJSON } = require('../lib/jsonStore');
const { supabase } = require('../lib/supabase');
const { savePhotoToStorage, loadPhotosMeta, savePhotoMeta, photoUpload } = require('../lib/photos');

router.post('/api/photos/upload', photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro' });
    const { profile = 'pessoal', tags = '', description = '' } = req.body;
    const ext      = path.extname(req.file.originalname) || '.jpg';
    const id       = 'photo_' + Date.now();
    const filename = id + ext;
    const buffer   = fs.readFileSync(req.file.path);
    const b64      = buffer.toString('base64');
    const dataUrl  = 'data:' + (req.file.mimetype || 'image/jpeg') + ';base64,' + b64;

    // Tenta salvar no Supabase Storage
    const { url: publicUrl, storage } = await savePhotoToStorage(buffer, filename, req.file.mimetype);

    // Limpa arquivo temporário
    try { fs.unlinkSync(req.file.path); } catch(e) {}

    const meta = {
      id, profile, filename, originalName: req.file.originalname,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      description, uploadedAt: new Date().toISOString(),
      publicUrl, dataUrl,
    };
    await savePhotoMeta(meta);
    res.json({ success: true, photo: meta, storage });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/api/photos', async (req, res) => {
  try {
    const { profile, tag } = req.query;
    let all = await loadPhotosMeta(profile);
    if (tag) all = all.filter(p => (p.tags || []).includes(tag));
    // Não retorna dataUrl na listagem (pesado)
    res.json(all.map(({ dataUrl, ...rest }) => rest));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/photos/suggest', async (req, res) => {
  try {
    const { topic, profile = 'pessoal', limit = 3 } = req.body;
    const all = await loadPhotosMeta(profile);
    if (!all.length) return res.json({ suggestions: [] });
    const photoList = all.map(p => 'ID: ' + p.id + ' | Tags: ' + (p.tags || []).join(', ') + ' | Descrição: ' + (p.description || '')).join('\n');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, messages: [{ role: 'user', content: 'Tema: "' + topic + '"\nFotos:\n' + photoList + '\nSeleciona até ' + limit + ' IDs. JSON: {"suggestions":["id1"]}' }] }),
    });
    const d = await r.json();
    const match  = d.content[0].text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { suggestions: [] };
    // Para cada ID sugerido, busca com dataUrl
    const allFull = await Promise.all(parsed.suggestions.slice(0, limit).map(async id => {
      // Tenta Supabase
      if (supabase) {
        const { data } = await supabase.from('photos_meta').select('*').eq('id', id).single();
        if (data) return { ...data, tags: data.tags || [], description: data.description || '', dataUrl: data.data_url };
      }
      return readJSON(PHOTOS_FILE).find(p => p.id === id);
    }));
    res.json({ suggestions: allFull.filter(Boolean) });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/api/photos/:id', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('photos_meta').select('*').eq('id', req.params.id).single();
      if (!error && data) return res.json({ ...data, tags: data.tags || [], dataUrl: data.data_url });
    }
    const photo = readJSON(PHOTOS_FILE).find(p => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'Não encontrada' });
    res.json(photo);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/api/photos/:id', async (req, res) => {
  try {
    if (supabase) {
      const { data } = await supabase.from('photos_meta').select('filename').eq('id', req.params.id).single();
      if (data?.filename) {
        await supabase.storage.from('photos').remove([data.filename]);
        await supabase.from('photos_meta').delete().eq('id', req.params.id);
      }
    }
    const all   = readJSON(PHOTOS_FILE);
    const photo = all.find(p => p.id === req.params.id);
    if (photo) {
      const fp = path.join(PHOTOS_DIR, photo.filename);
      if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch(e) {}
      writeJSON(PHOTOS_FILE, all.filter(p => p.id !== req.params.id));
    }
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
