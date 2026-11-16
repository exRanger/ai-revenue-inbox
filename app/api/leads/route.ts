import { z } from 'zod';
import { listLeadCards } from '@/db/queries';
import { demoLeads } from '@/lib/demo';
import { hasDb } from '@/env';
import { createLeadFromText } from '@/lib/intake';

export const runtime = 'nodejs';

const createSchema = z.object({
  source: z.string().min(1).default('web'),
  text: z.string().min(3),
  name: z.string().optional(),
  handle: z.string().optional()
});

export async function GET() {
  const leads = hasDb ? await listLeadCards() : demoLeads;
  return Response.json({ leads, mode: hasDb ? 'live' : 'demo' });
}

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  const result = await createLeadFromText(parsed.data);
  return Response.json(result, { status: result.persisted ? 201 : 200 });
}
