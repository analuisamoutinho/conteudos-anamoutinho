// ── Supabase ──────────────────────────────────────────────────────────────
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase conectado — dados persistentes entre deploys');
  } else {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ⚠️  AVISO: Supabase não configurado                         ║');
    console.log('║  Os dados (biblioteca, calendário, posts) serão apagados     ║');
    console.log('║  a cada novo deploy no Railway.                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
  }
} catch(e) {
  console.log('⚠️  Supabase não instalado — usando ficheiros locais');
}

async function checkSupabaseTables() {
  if (!supabase) return;
  try {
    const { error: e1 } = await supabase.from('generated_content').select('id').limit(1);
    const { error: e2 } = await supabase.from('calendars').select('id').limit(1);
    if (e1 || e2) {
      console.log('❌ Tabelas Supabase não encontradas — corre supabase-schema.sql');
    } else {
      console.log('✅ Tabelas Supabase verificadas');
    }
  } catch(e) { console.warn('Aviso ao verificar tabelas Supabase:', e.message); }
}

module.exports = { supabase, checkSupabaseTables };
