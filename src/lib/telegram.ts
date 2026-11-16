import { env, hasTelegram } from '@/env';

export async function sendTelegram(text: string, chatId?: string): Promise<boolean> {
  if (!hasTelegram) return false;
  const target = chatId ?? env.telegramAdminChatId!;
  const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: target, text: text.slice(0, 3900), disable_web_page_preview: true })
  });
  return res.ok;
}

export function verifyTelegramSecret(req: Request): boolean {
  if (!env.telegramWebhookSecret) return true;
  return req.headers.get('x-telegram-bot-api-secret-token') === env.telegramWebhookSecret;
}
