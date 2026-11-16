import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { conversations, drafts, events, leads } from '@/db/schema';
import { getLeadCard } from '@/db/queries';
import { hasDb } from '@/env';
import { syncApprovedLead } from '@/lib/google';
import { sendTelegram } from '@/lib/telegram';

export const runtime = 'nodejs';

const bodySchema = z.object({ editedBody: z.string().optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!hasDb || !db) return Response.json({ error: 'Demo mode: connect DATABASE_URL to approve leads.' }, { status: 503 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });

  const leadRows = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1);
  const lead = leadRows[0];
  if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

  const draftRows = await db.select().from(drafts).where(eq(drafts.leadId, lead.id)).limit(1);
  const draft = draftRows[0];
  const finalBody = parsed.data.editedBody ?? draft?.body ?? '';
  if (draft) {
    await db.update(drafts).set({ body: finalBody, approved: true, approvedAt: new Date() }).where(eq(drafts.id, draft.id));
  }

  let sent = false;
  if (lead.conversationId) {
    const convRows = await db.select().from(conversations).where(eq(conversations.id, lead.conversationId)).limit(1);
    const conv = convRows[0];
    if (lead.source === 'telegram' && conv?.externalId) {
      sent = await sendTelegram(finalBody, conv.externalId);
    }
  }

  const nextActionAt = new Date(Date.now() + 24 * 3600 * 1000);
  await db.update(leads).set({ status: 'confirmed', nextAction: sent ? 'Проверить ответ и зафиксировать следующий шаг' : 'Отправить ответ вручную и зафиксировать следующий шаг', nextActionAt, updatedAt: new Date() }).where(eq(leads.id, lead.id));
  await db.insert(events).values({ id: `E-${Date.now().toString(36)}`, leadId: lead.id, type: 'lead_approved', payload: { sent } });

  const card = await getLeadCard(lead.id);
  if (card) {
    try { await syncApprovedLead({ ...card, status: 'confirmed', nextActionAt: nextActionAt.toISOString() }); } catch { /* best-effort sync */ }
  }
  return Response.json({ ok: true, sent, leadId: lead.id });
}
