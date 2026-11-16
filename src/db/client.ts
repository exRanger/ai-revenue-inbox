import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hasDb, env } from '@/env';
import * as schema from './schema';

const client = hasDb ? postgres(env.databaseUrl!, { max: 5, prepare: false }) : null;
export const db = client ? drizzle(client, { schema }) : null;
