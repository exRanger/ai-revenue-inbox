import { z } from 'zod';

export const leadAnalysisSchema = z.object({
  intent: z.enum(['buy', 'question', 'support', 'spam', 'partnership', 'other']).default('other'),
  score: z.number().int().min(0).max(100).default(0),
  budget: z.string().default(''),
  deadline: z.string().default(''),
  contactName: z.string().default(''),
  contactHandle: z.string().default(''),
  summary: z.string().default(''),
  nextAction: z.string().default(''),
  draftReply: z.string().default(''),
  lostRisk: z.string().default('')
});

export type LeadAnalysis = z.infer<typeof leadAnalysisSchema>;
