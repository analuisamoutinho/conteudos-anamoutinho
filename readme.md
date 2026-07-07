# Máquina de Criativos v2.0 — Deploy Guide

## Novas funcionalidades
- ✅ Calendário editorial mensal gerado por IA com base no manual do cliente
- ✅ Publicação imediata no Instagram (feed único e carrossel)
- ✅ Agendamento automático de posts
- ✅ Upload de manual do cliente (PDF) para contextualizar o conteúdo
- ✅ Geração de 10 imagens em batch com GPT Image-1
- ✅ **Ritmo do feed** — capas alternam automaticamente entre foto da Ana ↔ respiro, mantendo a grade organizada
- ✅ **Banco de respiro** — fotos atmosféricas por mood (natural / digital / woman) para os slides sem rosto
- ✅ **Estilo editorial** — tipografia serifada (Fraunces) e gradiente suave nos slides de respiro, no padrão das referências do Instagram

---

## Carrosséis — como o feed fica organizado

Cada carrossel recebe um **tom de capa** definido pelo seletor **🎞️ Ritmo do feed** na tela de geração:

| Modo | Comportamento |
|---|---|
| 🔁 **Auto (alterna)** | Padrão. O 1º carrossel sai com a tua foto na capa, o próximo com respiro, e assim por diante — alternância guardada no navegador. |
| 👤 **Foto minha** | Todas as capas com a tua foto (Google Fotos). |
| 🌿 **Respiro** | Todas as capas com foto atmosférica (sem rosto). |

- O **miolo** dos slides é sempre respiro (atmosférico); **capa** e **fechamento** seguem o tom escolhido, deixando o post coeso.
- O **🌿 Mood do respiro** (natural / digital / woman) espelha as pastas de inspiração e alimenta tanto a seleção de foto quanto o prompt da IA.

### Banco de respiro (fotos reais)
As fotos de respiro vêm, nesta ordem: **(1)** banco de respiro → **(2)** Google Fotos → **(3)** geração por IA no mood.

Para abastecer o banco com fotos reais (dupephotos, Pinterest, banco próprio): tela de carrossel → **🌿 Mood** → **＋ Adicionar fotos** → cola as URLs (uma por linha). Elas são servidas via `/api/image/proxy` (sem problemas de CORS no canvas). Já vêm sementes editoriais por mood para funcionar de imediato.

> Os 3 templates de referência do Canva ficam cadastrados em **Templates** (`Carrossel Editorial — Capa Foto / Capa Respiro / Frase`) como o padrão visual do feed.

---

## Variáveis de ambiente (Railway)

| Variável | Obrigatória? | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sim | Chave da API da Anthropic (Claude) — geração de texto/copy |
| `OPENAI_API_KEY` | Sim | Chave da API da OpenAI — geração de imagem (GPT Image-1) e roteiros |
| `INSTAGRAM_ACCOUNT_ID_PESSOAL` | Sim (para publicar) | ID da conta Instagram Business (perfil pessoal, Ana Moutinho) |
| `INSTAGRAM_ACCESS_TOKEN` | Sim (para publicar) | Token de acesso de longa duração à Graph API do Instagram |
| `PUBLIC_URL` | Sim | URL pública gerada pelo Railway (ex: `https://xxxx.up.railway.app`) |
| `SUPABASE_URL` | Recomendado | URL do projeto Supabase — sem isso os dados (biblioteca, calendário, fotos) somem a cada novo deploy |
| `SUPABASE_SERVICE_KEY` | Recomendado | Service Role Key do Supabase |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional | Integração com Google Fotos |

## Deploy no Railway

1. Conecte o repositório no Railway — ele detecta `railway.json`/`package.json` automaticamente e roda `node server.js`
2. Configure as variáveis de ambiente acima em Project Settings → Variables
3. Deploy automático a cada push

---

## Novos endpoints

### Manual do cliente
- `POST /api/manual/upload` — upload de PDF (form-data: `profile`, `manual`)
- `GET /api/manual/status/:profile` — verifica se manual existe

### Calendário
- `POST /api/calendar/generate` — gera calendário mensal
- `GET /api/calendar/:profile/:year/:month` — busca calendário salvo
- `PATCH /api/calendar/:profile/:year/:month/post/:postId` — atualiza status de post

### Instagram
- `POST /api/instagram/post` — publicação imediata (feed único)
- `POST /api/instagram/carousel` — publicação imediata (carrossel 2–10 slides)
- `POST /api/instagram/schedule` — agendamento de post
- `GET /api/instagram/scheduled` — lista posts agendados
- `DELETE /api/instagram/scheduled/:id` — cancela agendamento
- `GET /api/instagram/insights/:profile` — dados do perfil

### Upload de imagem
- `POST /api/upload-image` — hospeda imagem e retorna URL pública
