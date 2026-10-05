import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './index.js';
import { logger } from '../config/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    logger.info('Starting migrations...');
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    logger.info('Migrations completed successfully.');
  } catch (error) {
    logger.error({ error }, 'Migration failed');
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

runMigrations();
