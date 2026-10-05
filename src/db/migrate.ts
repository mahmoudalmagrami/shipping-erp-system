import { migrate } from 'drizzle-orm/pglite/migrator';
import { db, queryClient } from './index.js';
import { logger } from '../config/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    logger.info('Database migrations completed successfully.');
  } catch (error) {
    logger.error({ error }, 'Migration failed');
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => queryClient.close())
    .catch(() => process.exit(1));
}
