export type LeadStatus = 'new' | 'confirmed' | 'done' | 'lost' | 'snoozed';

export type LeadCardData = {
  id: string;
  contactName: string;
  handle: string;
  source: string;
  status: LeadStatus;
  intent: string;
  score: number;
  budget: string;
  deadline: string;
  summary: string;
  nextAction: string;
  nextActionAt: string | null;
  draftBody: string;
  createdAt: string;
};

export type InboxPayload = {
  leads: LeadCardData[];
  mode: 'demo' | 'live';
};
