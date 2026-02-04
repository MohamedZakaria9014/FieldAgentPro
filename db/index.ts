import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const SQLITE_DB_NAME = 'fieldagentpro.db';

// Initialize the Expo SQLite database and Drizzle ORM instance.
export const sqlite = openDatabaseSync(SQLITE_DB_NAME);
export const db = drizzle(sqlite);
