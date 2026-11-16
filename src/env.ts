export const env = {
  databaseUrl: process.env.DATABASE_URL,
  llmProvider: (process.env.LLM_PROVIDER ?? 'heuristic').toLowerCase(),
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-latest',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  googleSheetId: process.env.GOOGLE_SHEET_ID,
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID,
  cronSecret: process.env.CRON_SECRET,
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000'
};

export const hasDb = Boolean(env.databaseUrl);
export const hasTelegram = Boolean(env.telegramBotToken && env.telegramAdminChatId);
export const hasGoogle = Boolean(env.googleClientEmail && env.googlePrivateKey && (env.googleSheetId || env.googleCalendarId));
