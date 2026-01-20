import { SQLITE_DB_NAME, sqlite } from './index';

export async function initDb(): Promise<void> {
  // Minimal "migration" to guarantee the table exists at launch.
  // (Drizzle migration tooling is typically run at build-time; for the challenge we ensure runtime init.)
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS shipments (
      order_id INTEGER PRIMARY KEY NOT NULL,
      status TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      client_company TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      contact_phone TEXT,
      delivery_date TEXT NOT NULL,
      end_time TEXT,
      task_type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      notes TEXT NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_shipments_delivery_date ON shipments(delivery_date);
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
    CREATE INDEX IF NOT EXISTS idx_shipments_is_deleted ON shipments(is_deleted);
  `);
}

export { SQLITE_DB_NAME };
