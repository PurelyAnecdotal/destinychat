import { db } from '$lib';

export function load() {
	const result = db.query(`SELECT COUNT(*) FROM books`).get() as { 'COUNT(*)': number };
	return {
		count: result['COUNT(*)']
	};
}


