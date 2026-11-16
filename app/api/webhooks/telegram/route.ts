import { createLeadFromText } from '@/lib/intake';
import { verifyTelegramSecret } from '@/lib/telegram';

export const runtime = 'nodejs';

type TelegramMessage = {
  text?: string;
  chat?: { id?: number | string; first_name?: string; last_name?: string; username?: string };
  from?: { first_name?: string; last_name?: string; username?: string };
};

export async function POST(req: Request) {
  if (!verifyTelegramSecret(req)) return Response.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const msg: TelegramMessage | undefined = body.message ?? body.edited_message;
  if (!msg?.text) return Response.json({ ok: true, ignored: true });

  const name = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ');
  const handle = msg.from?.username ? `@${msg.from.username}` : String(msg.chat?.id ?? '');
  await createLeadFromText({
    source: 'telegram',
    text: msg.text,
    name,
    handle,
    externalId: String(msg.chat?.id ?? '')
  });

  return Response.json({ ok: true });
}
