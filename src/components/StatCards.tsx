import type { LeadCardData } from '@/lib/types';

export function StatCards({ leads }: { leads: LeadCardData[] }) {
  const total = leads.length;
  const hot = leads.filter((lead) => lead.score >= 70 && !['done', 'lost'].includes(lead.status)).length;
  const overdue = leads.filter((lead) => lead.nextActionAt && new Date(lead.nextActionAt).getTime() < Date.now() && !['done', 'lost'].includes(lead.status)).length;
  const bySource = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="stats" aria-label="Сводка">
      <div className="stat"><span>Всего лидов</span><strong>{total}</strong></div>
      <div className="stat"><span>Горячие</span><strong>{hot}</strong></div>
      <div className="stat"><span>Просрочено</span><strong>{overdue}</strong></div>
      <div className="stat"><span>Источники</span><strong>{Object.entries(bySource).map(([k, v]) => `${k}:${v}`).join(' · ') || '—'}</strong></div>
    </section>
  );
}
