import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Keep the filename stable so native WorkManager can query it too.
export const SQLITE_DB_NAME = 'fieldagentpro.db';

export const sqlite = openDatabaseSync(SQLITE_DB_NAME);
export const db = drizzle(sqlite);
