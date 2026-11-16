import type { LeadCardData } from './types';

const now = Date.now();

export const demoLeads: LeadCardData[] = [
  {
    id: 'L-demo-1',
    contactName: 'Анна',
    handle: '@anna_ops',
    source: 'telegram',
    status: 'new',
    intent: 'buy',
    score: 86,
    budget: 'упомянут бюджет/деньги — уточнить диапазон',
    deadline: 'есть срочность — уточнить дату запуска',
    summary: 'Нужен бот для заявок + таблица, сейчас лиды теряются в личке. Срок — неделя.',
    nextAction: 'Ответить в течение 15 минут и предложить 20-минутный созвон',
    nextActionAt: new Date(now + 24 * 3600 * 1000).toISOString(),
    draftBody: 'Привет! Вижу, что заявки сейчас разлетаются по личке. Могу за неделю собрать intake → статусы → напоминания. Напишите, откуда приходят лиды и какой бюджет закладываете — вернусь с планом из 3 шагов.',
    createdAt: new Date(now - 42 * 60 * 1000).toISOString()
  },
  {
    id: 'L-demo-2',
    contactName: 'Марат',
    handle: 'marat@example.com',
    source: 'gmail',
    status: 'confirmed',
    intent: 'question',
    score: 61,
    budget: '',
    deadline: '',
    summary: 'Спрашивает, можно ли довести AI-MVP до стабильного релиза без переписывания.',
    nextAction: 'Отправить короткий чек-лист из 5 рисков и предложить аудит',
    nextActionAt: new Date(now + 6 * 3600 * 1000).toISOString(),
    draftBody: 'Марат, привет! Обычно переписывать не нужно: сначала фиксируем потери данных, ретраи, auth и ошибки интеграций. Могу за 30 минут показать 5 мест, где MVP чаще всего ломается перед релизом.',
    createdAt: new Date(now - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'L-demo-3',
    contactName: 'Спамер',
    handle: '@crypto_fast',
    source: 'web',
    status: 'lost',
    intent: 'spam',
    score: 3,
    budget: '',
    deadline: '',
    summary: 'Крипто-рассылка без релевантного запроса.',
    nextAction: 'Не тратить время',
    nextActionAt: null,
    draftBody: '',
    createdAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString()
  }
];
