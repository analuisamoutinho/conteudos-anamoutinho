const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { UPLOADS_DIR } = require('./src/config');
const { checkSupabaseTables } = require('./src/lib/supabase');
const { DEFAULT_QUALITY, VALID_QUALITIES } = require('./src/lib/userSettings');
const { processScheduledPosts } = require('./src/lib/instagram');

const app  = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use(require('./src/routes/userSettings'));
app.use(require('./src/routes/profiles'));
app.use(require('./src/routes/manual'));
app.use(require('./src/routes/photos'));
app.use(require('./src/routes/gphotos'));
app.use(require('./src/routes/calendar'));
app.use(require('./src/routes/carousel'));
app.use(require('./src/routes/contentMachine'));
app.use(require('./src/routes/trends'));
app.use(require('./src/routes/canva'));
app.use(require('./src/routes/content'));
app.use(require('./src/routes/instagram'));

setInterval(processScheduledPosts, 60000);

app.use('/uploads-generated', express.static(path.join(UPLOADS_DIR, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (req, res) => { res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` }); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

app.listen(PORT, () => {
  console.log(`🚀 Máquina de Conteúdo na porta ${PORT} | quality default: ${DEFAULT_QUALITY} | valid: ${VALID_QUALITIES.join(', ')}`);
  checkSupabaseTables();
});
