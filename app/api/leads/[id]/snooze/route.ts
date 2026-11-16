import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { events, leads } from '@/db/schema';
import { hasDb } from '@/env';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!hasDb || !db) return Response.json({ error: 'Demo mode: connect DATABASE_URL to snooze leads.' }, { status: 503 });
  const nextActionAt = new Date(Date.now() + 48 * 3600 * 1000);
  const updated = await db.update(leads).set({ status: 'snoozed', nextActionAt, updatedAt: new Date() }).where(eq(leads.id, params.id)).returning({ id: leads.id });
  if (!updated[0]) return Response.json({ error: 'Lead not found' }, { status: 404 });
  await db.insert(events).values({ id: `E-${Date.now().toString(36)}`, leadId: params.id, type: 'lead_snoozed', payload: { nextActionAt: nextActionAt.toISOString() } });
  return Response.json({ ok: true, leadId: params.id, nextActionAt: nextActionAt.toISOString() });
}
