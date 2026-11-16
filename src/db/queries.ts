import { desc, eq, inArray } from 'drizzle-orm';
import { db } from './client';
import { contacts, conversations, drafts, leads } from './schema';
import type { LeadCardData } from '@/lib/types';

export async function listLeadCards(limit = 50): Promise<LeadCardData[]> {
  if (!db) return [];
  const rows = await db
    .select({ lead: leads, contact: contacts, conversation: conversations, draft: drafts })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .leftJoin(conversations, eq(leads.conversationId, conversations.id))
    .leftJoin(drafts, eq(drafts.leadId, leads.id))
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  return rows.map(({ lead, contact, conversation, draft }) => ({
    id: lead.id,
    contactName: contact?.name ?? '',
    handle: contact?.handle ?? contact?.email ?? conversation?.externalId ?? '',
    source: lead.source,
    status: (lead.status as LeadCardData['status']) ?? 'new',
    intent: lead.intent ?? 'other',
    score: lead.score ?? 0,
    budget: lead.budget ?? '',
    deadline: lead.deadline ?? '',
    summary: lead.summary ?? '',
    nextAction: lead.nextAction ?? '',
    nextActionAt: lead.nextActionAt ? lead.nextActionAt.toISOString() : null,
    draftBody: draft?.body ?? '',
    createdAt: lead.createdAt.toISOString()
  }));
}

export async function getLeadCard(id: string): Promise<LeadCardData | null> {
  const rows = await db!
    .select({ lead: leads, contact: contacts, conversation: conversations, draft: drafts })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .leftJoin(conversations, eq(leads.conversationId, conversations.id))
    .leftJoin(drafts, eq(drafts.leadId, leads.id))
    .where(eq(leads.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const { lead, contact, conversation, draft } = row;
  return {
    id: lead.id,
    contactName: contact?.name ?? '',
    handle: contact?.handle ?? contact?.email ?? conversation?.externalId ?? '',
    source: lead.source,
    status: (lead.status as LeadCardData['status']) ?? 'new',
    intent: lead.intent ?? 'other',
    score: lead.score ?? 0,
    budget: lead.budget ?? '',
    deadline: lead.deadline ?? '',
    summary: lead.summary ?? '',
    nextAction: lead.nextAction ?? '',
    nextActionAt: lead.nextActionAt ? lead.nextActionAt.toISOString() : null,
    draftBody: draft?.body ?? '',
    createdAt: lead.createdAt.toISOString()
  };
}

export async function countByStatus(ids?: string[]) {
  if (!db) return { total: 0, new: 0, confirmed: 0, done: 0, lost: 0, snoozed: 0 };
  const rows = ids?.length
    ? await db.select({ status: leads.status }).from(leads).where(inArray(leads.id, ids))
    : await db.select({ status: leads.status }).from(leads);
  const acc = { total: rows.length, new: 0, confirmed: 0, done: 0, lost: 0, snoozed: 0 } as Record<string, number>;
  for (const row of rows) acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}
