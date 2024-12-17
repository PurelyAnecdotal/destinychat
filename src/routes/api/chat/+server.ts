import { env } from '$env/dynamic/private';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, type CoreMessage } from 'ai';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { db } from '$lib';

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY ?? '' });

export const POST = (async ({ request }) => {
	const json = await request.json();

	const messages: CoreMessage[] = json.messages;

	console.log(messages.findLast((x) => true));

	const result = streamText({
		model: openai('gpt-4o-mini'),
		messages,
		tools: {
			execute_sql: tool({
				description: 'Execute SQL query',
				parameters: z.object({
					query: z.string().describe('SQL query to execute')
				}),
				execute: async ({ query }) => {
					console.log(`Executing SQL query: ${query}`);

					try {
						const result = db.query(query).all();

						console.log(`SQL query result: ${JSON.stringify(result)}`);

						return result;
					} catch (error) {
						console.error(`Error executing SQL query: ${error}`);

						return [];
					}
				}
			})
		}
	});
	return result.toDataStreamResponse();
}) satisfies RequestHandler;
