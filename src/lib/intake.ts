import { db } from '@/db/client';
import { contacts, conversations, drafts, events, leads, messages } from '@/db/schema';
import { analyzeLead } from './llm';
import { sendTelegram } from './telegram';

export type IntakeInput = {
  source: string;
  text: string;
  name?: string;
  handle?: string;
  externalId?: string;
};

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createLeadFromText(input: IntakeInput) {
  const analysis = await analyzeLead(input.text, input.source);
  if (!db) {
    return { persisted: false, leadId: `demo-${Date.now()}`, analysis };
  }

  const contactId = id('C');
  const conversationId = id('CV');
  const messageId = id('M');
  const leadId = id('L');
  const draftId = id('D');
  const nextActionAt = analysis.intent === 'buy' ? new Date(Date.now() + 24 * 3600 * 1000) : null;

  await db.insert(contacts).values({
    id: contactId,
    name: analysis.contactName || input.name || '',
    handle: analysis.contactHandle || input.handle || ''
  }).onConflictDoNothing();

  await db.insert(conversations).values({
    id: conversationId,
    contactId,
    source: input.source,
    externalId: input.externalId ?? input.handle ?? null
  });

  await db.insert(messages).values({
    id: messageId,
    conversationId,
    direction: 'in',
    rawText: input.text
  });

  await db.insert(leads).values({
    id: leadId,
    contactId,
    conversationId,
    source: input.source,
    status: analysis.intent === 'spam' ? 'lost' : 'new',
    intent: analysis.intent,
    score: analysis.score,
    budget: analysis.budget,
    deadline: analysis.deadline,
    summary: analysis.summary,
    nextAction: analysis.nextAction,
    nextActionAt,
    lostReason: analysis.intent === 'spam' ? analysis.lostRisk || 'spam' : null
  });

  await db.insert(drafts).values({ id: draftId, leadId, body: analysis.draftReply });
  await db.insert(events).values({ id: id('E'), leadId, type: 'lead_created', payload: { source: input.source, score: analysis.score } });

  await sendTelegram(`Новый лид ${leadId}\nИсточник: ${input.source}\nScore: ${analysis.score}\nIntent: ${analysis.intent}\n\n${analysis.summary}\n\nNext: ${analysis.nextAction}`);
  return { persisted: true, leadId, analysis };
}
