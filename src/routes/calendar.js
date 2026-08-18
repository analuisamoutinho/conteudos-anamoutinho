const express = require('express');
const router  = express.Router();
const { GENERATED_FILE, CALENDAR_FILE } = require('../config');
const { readJSON, writeJSON } = require('../lib/jsonStore');
const { supabase } = require('../lib/supabase');
const { build7PilaresRR, getTiposCalendario, isTipoVideo } = require('../lib/methodology');
const { getAccount, getManualText } = require('../lib/brand');
const { extractJSON, normalizeDays } = require('../lib/util');
const { askOpenAI, MODEL_SMART } = require('../lib/ai');

// ═══════════════════════════════════════════════════════════════════════════
// CALENDÁRIO
// ═══════════════════════════════════════════════════════════════════════════

// Gera calendário MENSAL
router.post('/api/calendar/generate', async (req, res) => {
  try {
    const { month, year, profile, postsPerDay = 1 } = req.body;
    const manualNote  = getManualText(profile);
    const account     = getAccount(profile);
    const daysInMonth = new Date(year, month, 0).getDate();
    const tiposDisponiveis = getTiposCalendario().map(t => t.id).join(' | ');

    const BLOCK = 10;
    const allDays = [];
    for (let blockStart = 1; blockStart <= daysInMonth; blockStart += BLOCK) {
      const blockEnd = Math.min(blockStart + BLOCK - 1, daysInMonth);
      const daysInBlock = blockEnd - blockStart + 1;
      const brandContext = 'PERFIL: ' + account.name + ' (' + account.handle + ') — MARCA PESSOAL, Metodologia RR.';
      const examplePosts = postsPerDay === 1
        ? '[{"time":"09:00","type":"carrossel","topic":"O sinal de que o problema não é o tráfego, é a oferta"}]'
        : '[{"time":"09:00","type":"carrossel","topic":"A mentira que o Instagram vende sobre consistência"},{"time":"18:00","type":"frase","topic":"Você não precisa de motivação, precisa de estrutura"}]';
      const blockPrompt = 'Você é estrategista de conteúdo para Instagram, seguindo a Metodologia RR (Bolha RR, 7 pilares).\n\n' + build7PilaresRR() + '\nCrie o calendário editorial para ' + account.name + ' — ' + month + '/' + year + '.\n\n' + brandContext + '\n' + (manualNote ? 'DIRETRIZES DO PERFIL:\n' + manualNote + '\n\n' : '') + 'TIPOS DISPONÍVEIS: ' + tiposDisponiveis + '\nUse APENAS estes tipos. Não agende vídeo (lofi, video_curto, video_medio) — a gravação não entra no calendário.\n\nREGRAS DO TOPIC: Topics devem ser específicos e pessoais. Distribua os topics entre as 6 funções do Pilar 4 (Ramificações) ao longo do período — não repita a mesma função em dias seguidos.\nHORÁRIOS: use 09:00 para manhã e 18:00 para tarde/noite.\n\nRESPONDA APENAS COM JSON VÁLIDO, SEM MARKDOWN.\n\nFormato EXATO:\n{\n  "days": [\n    {"day": ' + blockStart + ', "posts": ' + examplePosts + '}\n  ]\n}\n\nGere TODOS os dias de ' + blockStart + ' a ' + blockEnd + ' (total: ' + daysInBlock + ' dias, ' + postsPerDay + ' post(s) por dia).';
      const rawText = await askOpenAI({ prompt: blockPrompt, model: MODEL_SMART, maxTokens: 4000, json: true });
      let blockDays = [];
      try { const parsed = extractJSON(rawText); blockDays = normalizeDays(parsed); }
      catch(parseErr) { for (let d = blockStart; d <= blockEnd; d++) blockDays.push({ day: d, posts: [] }); }
      allDays.push(...blockDays);
    }
    const generated = readJSON(GENERATED_FILE).filter(g => g.profile === profile);
    const calendarDays = allDays.map(dayEntry => {
      const dayNum = Number(dayEntry.day);
      const posts  = Array.isArray(dayEntry.posts) ? dayEntry.posts : [];
      return {
        day: dayNum,
        posts: posts.map(post => {
          const topic = (post.topic || post.tema || '').trim();
          const rawType = post.type || post.tipo || 'carrossel';
          const type  = isTipoVideo(rawType) ? 'carrossel' : rawType;
          const time  = post.time || post.horario || '09:00';
          const match = generated.find(g => g.calendarDay === dayNum && g.calendarMonth === month && g.calendarYear === year);
          return { time, type, topic, date: year + '-' + String(month).padStart(2,'0') + '-' + String(dayNum).padStart(2,'0'), contentId: match?.id || null, status: match?.status || 'pendente', scheduledAt: match?.scheduledAt || null };
        }),
      };
    });
    const totalPosts = calendarDays.reduce((acc, d) => acc + d.posts.length, 0);
    if (totalPosts === 0) throw new Error('A IA retornou calendário sem posts. Tenta novamente.');
    writeJSON(CALENDAR_FILE, { profile, month, year, calendar: calendarDays, savedAt: new Date().toISOString() });
    if (supabase) {
      await supabase.from('calendars').upsert({ id: profile + '_' + year + '_' + month, profile, month: parseInt(month), year: parseInt(year), data: JSON.stringify(calendarDays), updated_at: new Date().toISOString() }, { onConflict: 'id' });
    }
    res.json({ calendar: calendarDays });
  } catch(err) { console.error('[Calendar] Erro:', err); res.status(500).json({ error: err.message }); }
});

// Gera calendário SEMANAL
router.post('/api/calendar/generate-week', async (req, res) => {
  try {
    const { weekStart, profile, postsPerDay = 1 } = req.body;
    // weekStart = "2026-06-09" (segunda-feira da semana)
    const startDate = new Date(weekStart + 'T12:00:00Z');
    const manualNote = getManualText(profile);
    const account    = getAccount(profile);
    const tiposDisponiveis = getTiposCalendario().map(t => t.id).join(' | ');
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate); d.setUTCDate(startDate.getUTCDate() + i);
      weekDays.push({ date: d.toISOString().slice(0,10), dayOfWeek: ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][i] });
    }
    const daysText = weekDays.map(d => d.dayOfWeek + ' ' + d.date).join(', ');

    const examplePost = '{"time":"09:00","type":"carrossel","topic":"Tema específico aqui"}';
    const prompt = 'Você é estrategista de conteúdo para ' + account.name + ' (' + account.handle + '), seguindo a Metodologia RR (Bolha RR, 7 pilares).\n\n' + build7PilaresRR() + '\n' + (manualNote ? 'DIRETRIZES:\n' + manualNote + '\n\n' : '') + 'TIPOS DISPONÍVEIS: ' + tiposDisponiveis + '\nUse APENAS estes tipos. Não agende vídeo (lofi, video_curto, video_medio) — a gravação não entra no calendário.\n\nCrie um plano editorial para a semana: ' + daysText + '\n' + postsPerDay + ' post(s) por dia. Topics devem ser específicos e pessoais. Distribua entre as 6 funções do Pilar 4 (Ramificações) ao longo da semana.\n\nRESPONDA APENAS JSON VÁLIDO:\n{"days":[{"date":"2026-06-09","dayOfWeek":"Segunda","posts":[' + examplePost + ']}]}';
    const text = await askOpenAI({ prompt, model: MODEL_SMART, maxTokens: 3000, json: true });
    const parsed = extractJSON(text);
    const days = (parsed.days || []).map(d => ({
      ...d,
      posts: (d.posts || []).map(p => (isTipoVideo(p.type || p.tipo) ? { ...p, type: 'carrossel' } : p)),
    }));
    if (!days.length) throw new Error('IA retornou sem dias. Tente novamente.');
    res.json({ week: days, weekStart });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.patch('/api/calendar/saved', async (req, res) => {
  try {
    const { profile, month, year, calendar } = req.body;
    if (!profile || !month || !year || !calendar) return res.status(400).json({ error: 'Faltam campos.' });
    writeJSON(CALENDAR_FILE, { profile, month, year, calendar, savedAt: new Date().toISOString() });
    if (supabase) {
      await supabase.from('calendars').upsert({ id: profile + '_' + year + '_' + month, profile, month: parseInt(month), year: parseInt(year), data: JSON.stringify(calendar), updated_at: new Date().toISOString() }, { onConflict: 'id' });
    }
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/calendar/saved', async (req, res) => {
  try {
    const { profile, month, year } = req.query;
    if (supabase) {
      const { data, error } = await supabase.from('calendars').select('data, updated_at').eq('id', profile + '_' + year + '_' + month).single();
      if (!error && data?.data) {
        const calendar = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        return res.json({ found: true, calendar, savedAt: data.updated_at });
      }
    }
    const saved = readJSON(CALENDAR_FILE);
    if (saved?.profile === profile && String(saved.month) === String(month) && String(saved.year) === String(year) && saved.calendar?.length) {
      return res.json({ found: true, calendar: saved.calendar, savedAt: saved.savedAt });
    }
    res.json({ found: false });
  } catch(e) { res.json({ found: false }); }
});

module.exports = router;
