import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import path from 'path';
import fs from 'fs';
import * as schema from './schema.js';

const dataDir = path.resolve(process.cwd(), 'data/postgres');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const queryClient = new PGlite(dataDir);
export const db = drizzle(queryClient, { schema });
