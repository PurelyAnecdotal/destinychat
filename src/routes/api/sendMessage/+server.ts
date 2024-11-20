import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST({ request, cookies }) {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: await request.json()
	});

	return Response.json(completion.choices[0].message);
}
