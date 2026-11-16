import { listLeadCards } from '@/db/queries';
import { hasDb } from '@/env';
import { demoLeads } from '@/lib/demo';
import { LeadInbox } from '@/components/LeadInbox';
import { StatCards } from '@/components/StatCards';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const leads = hasDb ? await listLeadCards() : demoLeads;
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">AI Revenue Inbox</p>
          <h1>Лиды не должны умирать в личке</h1>
          <p className="sub">Intake → LLM-триаж → черновик → approve → follow-up → дашборд. Без auto-send: отправка только после человека.</p>
        </div>
        <div className={hasDb ? 'badge live' : 'badge demo'}>{hasDb ? 'LIVE DB' : 'DEMO MODE'}</div>
      </header>
      <StatCards leads={leads} />
      <LeadInbox initialLeads={leads} mode={hasDb ? 'live' : 'demo'} />
    </main>
  );
}
