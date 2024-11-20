import { Database } from 'bun:sqlite';

export const db = new Database();

db.run(`
ATTACH 'src/lib/db/books.sqlite' AS backup;
CREATE TABLE IF NOT EXISTS books AS SELECT * FROM backup.books;
`);

export interface Message {
	role: 'assistant' | 'user' | 'system';
	content: { type: 'text'; text: string }[];
}
