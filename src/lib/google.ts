import { google } from 'googleapis';
import { env, hasGoogle } from '@/env';
import type { LeadCardData } from './types';

function jwt() {
  if (!hasGoogle) return null;
  return new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });
}

export async function syncApprovedLead(lead: LeadCardData): Promise<void> {
  const auth = jwt();
  if (!auth) return;

  if (env.googleSheetId) {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSheetId,
      range: 'Лиды!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), lead.id, lead.contactName, lead.handle, lead.intent, lead.summary, lead.status, lead.source, lead.nextAction, lead.nextActionAt ?? '']]
      }
    });
  }

  if (env.googleCalendarId && lead.nextActionAt) {
    const calendar = google.calendar({ version: 'v3', auth });
    const start = new Date(lead.nextActionAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await calendar.events.insert({
      calendarId: env.googleCalendarId,
      requestBody: {
        summary: `Follow-up: ${lead.contactName || lead.handle || lead.id}`,
        description: `${lead.summary}\n\nNext: ${lead.nextAction}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() }
      }
    });
  }
}
