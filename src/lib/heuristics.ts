import type { LeadAnalysis } from './lead-schema';

const budgetRe = /(бюджет|budget|₽|руб|\$|€|\d+\s?(k|к|тыс|000))/i;
const deadlineRe = /(срок|deadline|завтра|сегодня|недел|month|day|asap|срочно)/i;
const buyRe = /(нужн|хочу|заказ|сделай|разработ|автомат|crm|бот|сайт|приложен|audit|аудит|mvp|интеграц)/i;
const spamRe = /(крипто|займ|бесплатно деньги|casino|накрут)/i;

export function heuristicAnalyze(rawText: string, source: string): LeadAnalysis {
  const text = rawText.trim();
  let score = 18;
  if (buyRe.test(text)) score += 32;
  if (budgetRe.test(text)) score += 20;
  if (deadlineRe.test(text)) score += 12;
  if (source === 'telegram') score += 5;
  if (spamRe.test(text)) score = 3;

  const phone = text.match(/\+?[\d\s()\-]{10,}/)?.[0]?.trim() ?? '';
  const handle = text.match(/@[a-zA-Z0-9_]{4,}/)?.[0] ?? '';
  const intent: LeadAnalysis['intent'] = spamRe.test(text) ? 'spam' : buyRe.test(text) ? 'buy' : 'question';

  return {
    intent,
    score: Math.max(0, Math.min(100, score)),
    budget: budgetRe.test(text) ? 'упомянут бюджет/деньги — уточнить диапазон' : '',
    deadline: deadlineRe.test(text) ? 'есть срочность — уточнить дату запуска' : '',
    contactName: '',
    contactHandle: handle || phone,
    summary: text.slice(0, 220),
    nextAction: intent === 'buy' ? 'Ответить в течение 15 минут и предложить 20-минутный созвон' : 'Уточнить задачу и бюджет одним коротким сообщением',
    draftReply: `Привет! Вижу запрос: «${text.slice(0, 140)}». Давайте быстро проверим, есть ли смысл идти дальше: напишите цель, срок и примерный бюджет — я вернусь с планом из 3 шагов и честной оценкой, что можно сделать за неделю.`,
    lostRisk: score < 35 ? 'низкая покупательская интенция' : ''
  };
}
