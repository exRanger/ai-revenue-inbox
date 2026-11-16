import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name'),
  handle: text('handle'),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ handleIdx: index('contacts_handle_idx').on(table.handle) }));

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  source: text('source').notNull(),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ sourceExternalIdx: index('conversations_source_external_idx').on(table.source, table.externalId) }));

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => conversations.id).notNull(),
  direction: text('direction').notNull(),
  rawText: text('raw_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  conversationId: text('conversation_id').references(() => conversations.id),
  source: text('source').notNull(),
  status: text('status').notNull().default('new'),
  intent: text('intent'),
  score: integer('score').notNull().default(0),
  budget: text('budget'),
  deadline: text('deadline'),
  summary: text('summary'),
  nextAction: text('next_action'),
  nextActionAt: timestamp('next_action_at', { withTimezone: true }),
  lostReason: text('lost_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ statusIdx: index('leads_status_idx').on(table.status), sourceIdx: index('leads_source_idx').on(table.source) }));

export const drafts = pgTable('drafts', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').references(() => leads.id).notNull(),
  body: text('body').notNull(),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true })
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').references(() => leads.id),
  type: text('type').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type Lead = typeof leads.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
