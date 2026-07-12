const fs = require('fs');
const { CANVA_TEMPLATES_FILE } = require('../config');

// ═══════════════════════════════════════════════════════════════════════════
// CANVA TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CANVA_TEMPLATES = [
  { id: 'tmpl_default_001', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Estáticos - Chamada em Destaque [Handwriting]', contentTypes: ['frase'], aesthetic: 'Handwriting, chamada de atenção em destaque, estilo manuscrito', slideCount: 1, canvaUrl: 'https://www.canva.com/design/DAHL5Modgyc/vEEcxRj9jnHi4dFKqSm_pA/edit', profile: 'all' },
  { id: 'tmpl_default_002', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Estáticos [Sublime]', contentTypes: ['frase'], aesthetic: 'Elegante, minimalista, identidade visual sóbria', slideCount: 1, canvaUrl: 'https://www.canva.com/design/DAHL5R5kU2Y/xIyRwYXAdmFCqKaYiw3dYA/edit', profile: 'all' },
  { id: 'tmpl_default_003', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel - Recomendações', contentTypes: ['carrossel', 'lista'], aesthetic: 'Carrossel de indicações e recomendações', slideCount: 178, canvaUrl: 'https://www.canva.com/design/DAHL5TqhKyI/etk6efSME5DhFwZ4hgdDuw/edit', profile: 'all' },
  { id: 'tmpl_default_004', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel [Flow]', contentTypes: ['carrossel'], aesthetic: 'Estilo Flow, fluido e moderno', slideCount: 47, canvaUrl: 'https://www.canva.com/design/DAHMlM5WCeE/NRbPJN3Jh8i3pp0ZeFENA/edit', profile: 'all' },
  { id: 'tmpl_default_005', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post Carrossel [StudioMoulin]', contentTypes: ['carrossel'], aesthetic: 'Estilo StudioMoulin, editorial sofisticado', slideCount: 67, canvaUrl: 'https://www.canva.com/design/DAHMlGdvovg/OKFiMiynrALoa53TnTlrnQ/edit', profile: 'all' },
  { id: 'tmpl_default_006', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Sobre Mim [Lifestyle]', contentTypes: ['bastidores', 'dump'], aesthetic: 'Lifestyle, conteúdo pessoal, autêntico e íntimo', slideCount: 86, canvaUrl: 'https://www.canva.com/design/DAHL5N_tvhA/7MZi0VRLPp3QdXBEklwYVw/edit', profile: 'all' },
  { id: 'tmpl_default_007', createdAt: '2026-06-14T00:00:00.000Z', name: 'Posts Variados [Flow]', contentTypes: ['carrossel', 'frase'], aesthetic: 'Estilo Flow, versátil e dinâmico', slideCount: 18, canvaUrl: 'https://www.canva.com/design/DAHMlDU5T9U/edit', profile: 'all' },
  { id: 'tmpl_default_008', createdAt: '2026-06-14T00:00:00.000Z', name: 'Post para Frase [StudioMoulin]', contentTypes: ['frase'], aesthetic: 'Estilo StudioMoulin, elegante para frases e citações', slideCount: 22, canvaUrl: 'https://www.canva.com/design/DAHMlPnisuI/E7t-QxVHNLMOSxIAQ6oMiw/edit', profile: 'all' },
  { id: 'tmpl_default_009', createdAt: '2026-06-14T00:00:00.000Z', name: 'Capa para Photodump', contentTypes: ['dump'], aesthetic: 'Capa criativa para posts estilo photodump', slideCount: 87, canvaUrl: 'https://www.canva.com/design/DAHL5RVJ-ug/o_RsgOzgY8HsDubf1vnAOQ/edit', profile: 'all' }
];

function loadCT() {
  try {
    if (!fs.existsSync(CANVA_TEMPLATES_FILE)) {
      fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2));
      return DEFAULT_CANVA_TEMPLATES;
    }
    const data = JSON.parse(fs.readFileSync(CANVA_TEMPLATES_FILE, 'utf8'));
    if (!data.length) { fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(DEFAULT_CANVA_TEMPLATES, null, 2)); return DEFAULT_CANVA_TEMPLATES; }
    return data;
  } catch(e) { return DEFAULT_CANVA_TEMPLATES; }
}
function saveCT(t) { try { fs.writeFileSync(CANVA_TEMPLATES_FILE, JSON.stringify(t, null, 2)); } catch(e) {} }

module.exports = { loadCT, saveCT, DEFAULT_CANVA_TEMPLATES };
