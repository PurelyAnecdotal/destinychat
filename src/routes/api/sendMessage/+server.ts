import { db, type Message, type ToolCallMessage } from '$lib';
import OpenAI from 'openai';

const openai = new OpenAI();

const model: OpenAI.Chat.ChatModel = 'gpt-4o-mini';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
	{
		type: 'function',
		function: {
			name: 'execute_sql',
			description: 'Execute SQL query',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'SQL query to execute'
					}
				}
			}
		}
	}
];

export async function POST({ request }) {
	// await new Promise(resolve => setTimeout(resolve, 1000));

	// return Response.json({
	// 	content: `Hello, world! ${Math.random()}`,
	// 	role: 'assistant'
	// });

	const messages: Message[] = await request.json();

	const new_messages = await completeChat(messages);

	return Response.json(new_messages);
}

async function completeChat(messages: Message[]): Promise<Message[]> {
	const response = await openai.chat.completions.create({ model, messages, tools });

	if (
		response.choices[0].finish_reason === 'tool_calls' &&
		response.choices[0].message.tool_calls
	) {
		const tool_call = response.choices[0].message.tool_calls[0];

		if (tool_call.type !== 'function' || tool_call.function.name !== 'execute_sql') return [];

		const args = JSON.parse(tool_call.function.arguments);

		console.log(`Executing SQL query: ${args.query}`);

		let db_result: unknown;

		try {
			db_result = db.query(args.query).all();
		} catch (error) {
			console.error(`Error executing SQL query: ${error}`);

			return [];
		}

		console.log(`SQL query result: ${JSON.stringify(db_result)}`);

		const new_messages: Message[] = [
			response.choices[0].message,
			{
				role: 'tool',
				content: [
					{
						type: 'text',
						text: JSON.stringify(db_result)
					}
				],
				tool_call_id: tool_call.id
			}
		];

		console.log(new_messages);

		const final_response = await openai.chat.completions.create({
			model,
			messages: [...messages, ...new_messages]
		});

		const final_completion_message = final_response.choices[0].message;

		if (!final_completion_message.content) return [];

		new_messages.push(convertCompletionMessage(final_completion_message));

		return new_messages;
	}

	const completion_message = response.choices[0].message;

	if (!completion_message.content) return [];

	console.log(completion_message.content);

	return [convertCompletionMessage(completion_message)];
}

function convertCompletionMessage(
	completionMessage: OpenAI.Chat.Completions.ChatCompletionMessage
): Message {
	if (!completionMessage.content) return { role: 'assistant', content: [] };

	return {
		role: completionMessage.role,
		content: [
			{
				type: 'text',
				text: completionMessage.content
			}
		]
	};
}
