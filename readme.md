# Máquina de Criativos v2.0 — Deploy Guide

## Novas funcionalidades
- ✅ Calendário editorial mensal gerado por IA com base no manual do cliente
- ✅ Publicação imediata no Instagram (feed único e carrossel)
- ✅ Agendamento automático de posts
- ✅ Upload de manual do cliente (PDF) para contextualizar o conteúdo
- ✅ Geração de 10 imagens em batch com GPT Image-1

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic (Claude) — geração de texto/copy |
| `OPENAI_API_KEY` | Chave da API da OpenAI — geração de imagem (GPT Image-1) e roteiros |
| `INSTAGRAM_ACCOUNT_ID_PESSOAL` | ID da conta Instagram (perfil pessoal, Ana Moutinho) |
| `INSTAGRAM_ACCESS_TOKEN` (ou `INSTAGRAM_TOKEN_PESSOAL`) | Token de acesso à Graph API do Instagram |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Recomendado — sem isso os dados (biblioteca, calendário, fotos) somem a cada novo deploy |
| `PUBLIC_URL` | URL pública onde a app está hospedada |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional — integração com Google Fotos |
| `CRON_SECRET` | Opcional — protege o endpoint `/api/cron/process-scheduled` |

---

## Deploy na Vercel

Este projeto está pronto para deploy na Vercel (ver `vercel.json`).

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Configure as variáveis de ambiente acima em Project Settings → Environment Variables
3. Deploy — a Vercel detecta `vercel.json` e sobe `server.js` como função serverless, servindo `public/index.html` como frontend
4. **Agendamento de posts:** como funções serverless não mantêm processos em background, o agendamento roda via **Vercel Cron** (`/api/cron/process-scheduled`, configurado em `vercel.json` a cada 5 min). No plano **Hobby** da Vercel, cron jobs só rodam 1x/dia — para agendamento com granularidade de minutos é necessário o plano **Pro**.
5. **Duração de função:** geração de imagem (GPT Image-1) pode levar dezenas de segundos. `vercel.json` já define `maxDuration: 60`, mas isso só é respeitado em planos pagos (no Hobby o limite é 10s) — se notar timeouts na geração de imagem, considere o plano Pro.

## Deploy no Railway (alternativa)

1. Conecte o repositório no Railway — ele detecta `railway.json`/`package.json` automaticamente
2. Configure as mesmas variáveis de ambiente acima
3. Deploy automático a cada push (`node server.js`, sem limite de duração de request nem necessidade de cron externo — o `setInterval` interno cuida do agendamento)

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
