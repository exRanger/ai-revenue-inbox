# AI Revenue Inbox

Human-in-the-loop инбокс для лидов: заявки падают из Telegram/web/manual POST, LLM делает triage, собирает черновик ответа, ставит score и next action. Отправка — только после approve человеком. После подтверждения создаётся follow-up, пишется событие, опционально синкается Google Sheet/Calendar, вечерний дайджест уходит в Telegram.

## Что уже есть
- Next.js 14 + TypeScript + Drizzle + Postgres.
- Demo mode без `DATABASE_URL`: UI поднимается на seed-данных, действия применяются локально.
- Live mode: Postgres persistence, Telegram webhook intake, manual web intake, approve/snooze API, daily digest cron route.
- LLM abstraction: OpenAI/Anthropic через env; без ключей — детерминированный heuristic analyzer, чтобы демо не зависело от внешнего API.
- Prompt-injection guard: inbound message передаётся как untrusted data, не как инструкция.
- Google sync: service account append в Sheet и event в Calendar; без env — best-effort no-op.

## Быстрый старт
```bash
cp .env.example .env.local
npm install
npm run dev
```
Открой `http://localhost:3000`. Без env это demo mode.

## Live mode
1. Создай Postgres и пропиши `DATABASE_URL`.
2. `npm run db:push`.
3. Telegram: создай бота, заполни `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, поставь webhook на `POST /api/webhooks/telegram` с `secret_token`.
4. LLM: `LLM_PROVIDER=openai` + `OPENAI_API_KEY` или `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. Без ключей останется heuristic mode.
5. Cron: дергай `GET /api/cron/daily-digest` с `Authorization: Bearer CRON_SECRET`.

## API
- `GET /api/health`
- `GET /api/leads`
- `POST /api/leads` `{ source, text, name?, handle? }`
- `POST /api/webhooks/telegram`
- `POST /api/leads/:id/approve` `{ editedBody? }`
- `POST /api/leads/:id/snooze`
- `GET /api/cron/daily-digest`

## Границы честно
- Auto-send выключен by design: approve создаёт отправку только для Telegram source, остальное помечается «отправить вручную».
- Gmail/Google OAuth verification может быть болью; service account покрывает Sheets/Calendar, но не чтение чужой почты.
- Нет авто-постинга в Threads и массовых рассылок: это быстро упирается в лимиты/баны.
- Это MVP scaffold, а не production SaaS: auth, rate limits, retries queue, observability и тесты — следующий слой.
- Перед продом прогони `npm audit` и обнови Next до патченной версии в своей ветке; здесь версия зафиксирована для воспроизводимого MVP build.

## Демо-сценарий для записи
1. `POST /api/leads` с текстом «Нужен бот для заявок, бюджет 50к, срок неделя».
2. В UI появляется лид со score, summary и draft.
3. Правишь черновик → Approve → статус `confirmed`, follow-up на завтра, event записан.
4. `GET /api/cron/daily-digest` → сводка в Telegram.
