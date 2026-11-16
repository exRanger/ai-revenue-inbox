import { countByStatus, listLeadCards } from '@/db/queries';
import { env, hasDb } from '@/env';
import { demoLeads } from '@/lib/demo';
import { sendTelegram } from '@/lib/telegram';

export const runtime = 'nodejs';

function authorized(req: Request) {
  if (!env.cronSecret) return true;
  return req.headers.get('authorization') === `Bearer ${env.cronSecret}` || req.headers.get('x-cron-secret') === env.cronSecret;
}

export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ ok: false }, { status: 401 });
  if (!hasDb) {
    return Response.json({ ok: true, demo: true, total: demoLeads.length });
  }
  const stats = await countByStatus();
  const overdue = (await listLeadCards(100)).filter((lead) => lead.nextActionAt && new Date(lead.nextActionAt).getTime() < Date.now() && !['done', 'lost'].includes(lead.status));
  const text = `Дайджест лидов\nВсего: ${stats.total}\nНовые: ${stats.new}\nПодтверждены: ${stats.confirmed}\nСделаны: ${stats.done}\nСлив: ${stats.lost}\nПросрочено follow-up: ${overdue.length}`;
  const sent = await sendTelegram(text);
  return Response.json({ ok: true, sent, stats, overdue: overdue.map((lead) => lead.id) });
}
