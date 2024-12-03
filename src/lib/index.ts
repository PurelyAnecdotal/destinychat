import { Database } from 'bun:sqlite';
import type OpenAI from 'openai';

export const db = new Database();

db.run(`
ATTACH 'src/lib/db/books.sqlite' AS backup;
CREATE TABLE IF NOT EXISTS books AS SELECT * FROM backup.books;
`);

export type Message =
	| UserMessage
	| SystemMessage
	| AssistantMessage
	| AssistantToolCallMessage
	| ToolMessage;

interface MessageContent {
	type: 'text';
	text: string;
}

interface ToolCall {
	type: string;
	id: string;
}

export interface FunctionCall extends ToolCall {
	type: 'function';
	function: {
		arguments: string;
		name: string;
	};
}

interface MessageBase {
	role: string;
	content: MessageContent[] | null;
}

export interface UserMessage extends MessageBase {
	role: 'user';
	content: MessageContent[];
}

export interface SystemMessage extends MessageBase {
	role: 'system';
	content: MessageContent[];
}

interface AssistantMessageBase extends MessageBase {
	role: 'assistant';
}

export interface AssistantChatMessage extends AssistantMessageBase {
	content: MessageContent[];
}

export interface AssistantToolCallMessage extends AssistantMessageBase {
	content: null;
	tool_calls: FunctionCall[];
}

export type AssistantMessage = AssistantChatMessage | AssistantToolCallMessage;

export interface ToolMessage extends MessageBase {
	role: 'tool';
	tool_call_id: string;
	content: MessageContent[];
}
