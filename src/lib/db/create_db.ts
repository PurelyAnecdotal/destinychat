import { Database } from 'bun:sqlite';
import { XMLParser } from 'fast-xml-parser';
import type { DestinyData } from './DestinyData';

const before = performance.now();

const parser = new XMLParser();

// const xml: DestinyData = parser.parse(await Bun.file('books.xml').text());

const xml: DestinyData = JSON.parse(await Bun.file('books.json').text());

const books = xml.DestinyCustomReport.Row;

const db = new Database();

createTable('books');

const stmt = db.query(`
	INSERT INTO books (
		barcode, 
		call_number, 
		sublocation, 
		author, 
		subject, 
		title, 
		description,
		copies
	)
	SELECT 
		?, ?, ?, ?, ?, ?, ?,
		COALESCE(MAX(copies), 0) + 1
	FROM books 
	WHERE call_number = ?
`);

books.forEach((book) => {
	try {
		stmt.run(
			book.copyBarcode,
			book.callNumber,
			book.sublocation ?? '',
			book.author ?? '',
			book.subject ?? '',
			book.title.toString(),
			book.description1 ?? '',
			book.callNumber
		);
	} catch (err) {}
});

console.log(`done after ${performance.now() - before}ms`);

db.run(`VACUUM main INTO './books.sqlite'`);

function createTable(table: string) {
	db.run(
		`
		CREATE TABLE IF NOT EXISTS ${table} (
			barcode TEXT PRIMARY KEY,
			call_number TEXT,
			sublocation TEXT, 
			author TEXT,
			subject TEXT,
			title TEXT,
			description TEXT,
			copies INTEGER DEFAULT 1
		);

		CREATE INDEX IF NOT EXISTS idx_books_call_number ON books (call_number);
	`
	);
}

function deleteTable(table: string) {
	db.run(`DROP TABLE IF EXISTS ${table}`);
}
