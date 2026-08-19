const express = require('express');
const router = express.Router();
const { getMetodologia } = require('../lib/methodology');
const { DEFAULT_PROFILES, loadProfiles, saveProfiles } = require('../lib/profiles');

router.get('/api/tipos-conteudo', (req, res) => {
  const { tipos } = getMetodologia();
  res.json({
    metodologia: 'bd',
    tipos: Object.values(tipos).map(t => ({
      id: t.id, emoji: t.emoji, label: t.label,
      categoria: t.categoria || 'Marca Pessoal',
      desc: t.instrucao?.split('.')[0] || '',
    })),
  });
});

router.get('/api/profiles', (req, res) => { res.json(loadProfiles()); });

router.get('/api/profiles/:id', (req, res) => {
  const p = loadProfiles()[req.params.id];
  if (!p) return res.status(404).json({ error: 'Perfil não encontrado' });
  res.json(p);
});

router.patch('/api/profiles/:id', (req, res) => {
  try {
    const profiles = loadProfiles();
    if (!profiles[req.params.id]) return res.status(404).json({ error: 'Perfil não encontrado' });
    profiles[req.params.id] = {
      ...profiles[req.params.id], ...req.body,
      profileId: req.params.id, updatedAt: new Date().toISOString(),
    };
    saveProfiles(profiles);
    res.json({ success: true, profile: profiles[req.params.id] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/profiles', (req, res) => {
  try {
    const profiles = loadProfiles();
    const id = req.body.profileId || `profile_${Date.now()}`;
    if (profiles[id]) return res.status(409).json({ error: 'ID já existe' });
    profiles[id] = { ...DEFAULT_PROFILES.pessoal, ...req.body, profileId: id, updatedAt: new Date().toISOString() };
    saveProfiles(profiles);
    res.json({ success: true, profile: profiles[id] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
