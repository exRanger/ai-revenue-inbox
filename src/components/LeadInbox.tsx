"use client";

import { useMemo, useState } from 'react';
import type { LeadCardData, LeadStatus } from '@/lib/types';

type Props = { initialLeads: LeadCardData[]; mode: 'demo' | 'live' };

export function LeadInbox({ initialLeads, mode }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const sorted = useMemo(() => [...leads].sort((a, b) => b.score - a.score), [leads]);

  function patch(id: string, next: Partial<LeadCardData>) {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...next } : lead)));
  }

  return (
    <section className="inbox" aria-label="Входящие лиды">
      {sorted.map((lead) => (
        <LeadCard key={lead.id} lead={lead} mode={mode} onPatch={patch} />
      ))}
    </section>
  );
}

function LeadCard({ lead, mode, onPatch }: { lead: LeadCardData; mode: 'demo' | 'live'; onPatch: (id: string, next: Partial<LeadCardData>) => void }) {
  const [draft, setDraft] = useState(lead.draftBody);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function call(path: string, body?: unknown, fallbackStatus?: LeadStatus) {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setNote(json.sent ? 'Ответ отправлен в Telegram' : 'Подтверждено. Если канал не настроен — отправь вручную.');
      if (fallbackStatus) onPatch(lead.id, { status: fallbackStatus, draftBody: draft });
    } catch (error) {
      if (mode === 'demo') {
        if (fallbackStatus) onPatch(lead.id, { status: fallbackStatus, draftBody: draft });
        setNote('Demo mode: действие применено локально. Подключи DATABASE_URL для настоящей отправки.');
      } else {
        setNote(error instanceof Error ? error.message : 'Ошибка действия');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`card status-${lead.status}`}>
      <div className="cardTop">
        <div>
          <h2>{lead.contactName || lead.handle || lead.id}</h2>
          <p className="meta">{lead.source} · {lead.intent} · {new Date(lead.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        <div className="score" aria-label={`score ${lead.score}`}>{lead.score}</div>
      </div>
      <p className="summary">{lead.summary}</p>
      <div className="facts">
        {lead.budget ? <span>{lead.budget}</span> : null}
        {lead.deadline ? <span>{lead.deadline}</span> : null}
        {lead.nextActionAt ? <span>follow-up: {new Date(lead.nextActionAt).toLocaleString('ru-RU')}</span> : null}
      </div>
      <p className="next"><b>Next:</b> {lead.nextAction}</p>
      <label className="draftLabel" htmlFor={`draft-${lead.id}`}>Черновик ответа</label>
      <textarea id={`draft-${lead.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} />
      <div className="actions">
        <button disabled={busy} onClick={() => call(`/api/leads/${lead.id}/approve`, { editedBody: draft }, 'confirmed')}>Approve</button>
        <button disabled={busy} onClick={() => call(`/api/leads/${lead.id}/snooze`, {}, 'snoozed')}>Snooze 48h</button>
        <button disabled={busy} onClick={() => onPatch(lead.id, { status: 'done' })}>Mark done</button>
      </div>
      {note ? <p className="note" role="status">{note}</p> : null}
    </article>
  );
}
