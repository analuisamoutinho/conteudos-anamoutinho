const { GENERATED_FILE } = require('../config');
const { readJSON, writeJSON } = require('./jsonStore');
const { supabase } = require('./supabase');

// ── Conteúdo gerado ───────────────────────────────────────────────────────
function saveGeneratedContent(item) {
  const all = readJSON(GENERATED_FILE);
  all.unshift(item);
  writeJSON(GENERATED_FILE, all);
  if (supabase) {
    supabase.from('generated_content').upsert({
      id: item.id, profile: item.profile, type: item.type,
      status: item.status, topic: item.topic || null,
      caption: item.caption || null, hashtags: item.hashtags || null,
      carousel_data: item.carouselData ? JSON.stringify(item.carouselData) : null,
      content_machine_type: item.contentMachineType || null,
      calendar_day: item.calendarDay || null,
      calendar_month: item.calendarMonth || null,
      calendar_year: item.calendarYear || null,
      image_urls: item.imageUrls || [],
      created_at: item.createdAt,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('Supabase save:', error.message);
    });
  }
  return item;
}

function updateContentStatus(id, status, extra = {}) {
  const all = readJSON(GENERATED_FILE);
  const idx = all.findIndex(i => i.id === id);
  if (idx !== -1) { all[idx] = { ...all[idx], status, ...extra }; writeJSON(GENERATED_FILE, all); }
  if (supabase) {
    const updates = { status };
    if (extra.imageUrls)    updates.image_urls   = extra.imageUrls;
    if (extra.publishedAt)  updates.published_at = extra.publishedAt;
    if (extra.scheduledAt)  updates.scheduled_at = extra.scheduledAt;
    if (extra.instagramId)  updates.instagram_id = extra.instagramId;
    supabase.from('generated_content').update(updates).eq('id', id)
      .then(({ error }) => { if (error) console.error('Supabase update:', error.message); });
  }
}

// NOVO: atualiza imageUrls de um conteúdo já existente
function updateContentImages(id, imageUrls) {
  const all = readJSON(GENERATED_FILE);
  const idx = all.findIndex(i => i.id === id);
  if (idx !== -1) {
    all[idx].imageUrls = imageUrls;
    writeJSON(GENERATED_FILE, all);
  }
  if (supabase) {
    supabase.from('generated_content')
      .update({ image_urls: imageUrls })
      .eq('id', id)
      .then(({ error }) => { if (error) console.error('Supabase updateImages:', error.message); });
  }
}

async function loadGeneratedContent(profile) {
  if (supabase) {
    const { data, error } = await supabase.from('generated_content')
      .select('*').eq('profile', profile).order('created_at', { ascending: false });
    if (!error && data?.length) {
      return data.map(r => ({
        id: r.id, profile: r.profile, type: r.type, status: r.status,
        topic: r.topic, caption: r.caption, hashtags: r.hashtags,
        carouselData: r.carousel_data ? JSON.parse(r.carousel_data) : null,
        contentMachineType: r.content_machine_type,
        calendarDay: r.calendar_day, calendarMonth: r.calendar_month,
        calendarYear: r.calendar_year, createdAt: r.created_at,
        imageUrls: r.image_urls || [],
      }));
    }
  }
  return readJSON(GENERATED_FILE).filter(i => !profile || i.profile === profile);
}

module.exports = { saveGeneratedContent, updateContentStatus, updateContentImages, loadGeneratedContent };
