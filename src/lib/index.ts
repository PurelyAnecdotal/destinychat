import { Database } from 'bun:sqlite';
import type OpenAI from 'openai';

export const db = new Database();

db.run(`
ATTACH 'src/lib/db/books.sqlite' AS backup;
CREATE TABLE IF NOT EXISTS books AS SELECT * FROM backup.books;
`);

export type Message = UserMessage | SystemMessage | AssistantMessage | ToolCallMessage;

interface MessageContent {
	type: 'text';
	text: string;
}

export type UserMessage = {
	role: 'user';
	content: MessageContent[];
};

export type SystemMessage = {
	role: 'system';
	content: MessageContent[];
};

export type AssistantMessage = {
	role: 'assistant';
	content: MessageContent[];
};

export type ToolCallMessage = {
	role: 'tool';
	content: MessageContent[];
	tool_call_id: string;
};

// export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;
