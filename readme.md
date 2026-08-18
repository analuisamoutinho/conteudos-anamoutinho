# Máquina de Criativos v2.0 — Deploy Guide

## Novas funcionalidades
- ✅ Calendário editorial mensal gerado por IA com base no manual do cliente
- ✅ Publicação imediata no Instagram (feed único e carrossel)
- ✅ Agendamento automático de posts
- ✅ Upload de manual do cliente (PDF) para contextualizar o conteúdo
- ✅ Geração de 10 imagens em batch com GPT Image-1

---

## Variáveis de ambiente (Railway)

| Variável | Obrigatória? | Descrição |
|---|---|---|
| `OPENAI_API_KEY` | Sim | Chave da API da OpenAI — **única chave de IA do projeto**: copy, carrossel, calendário, tendências, roteiros e geração de imagem |
| `OPENAI_MODEL_SMART` | Opcional | Modelo para geração criativa (padrão: `gpt-4o`) |
| `OPENAI_MODEL_FAST` | Opcional | Modelo para tarefas mecânicas — match de template, escolha de fotos (padrão: `gpt-4o-mini`) |
| `OPENAI_IMAGE_MODEL` | Opcional | Modelo de imagem (padrão: `gpt-image-2`) |
| `OPENAI_IMAGE_MODEL_FALLBACK` | Opcional | Usado automaticamente se a conta não tiver acesso ao modelo acima (padrão: `gpt-image-1`) |
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
