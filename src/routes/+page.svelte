<script lang="ts">
	import { browser } from '$app/environment';
	import { type Message } from '$lib';
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let input = $state('');

	let textarea: HTMLTextAreaElement;

	const initial_messages: Message[] = [
		{
			role: 'system',
			content: [
				{
					type: 'text',
					text: 'You are a helpful library assistant who helps people with finding a book in a database by making SQL queries. The table is named "books" and has the columns "barcode", "call_number", "sublocation", "author", "subject", "title", "description", and "copies".'
				}
			]
		},
		{
			role: 'assistant',
			content: [{ type: 'text', text: 'Hello! What are you looking for in the library database?' }]
		}
	];

	let messages: Message[] = $state(initial_messages);

	let messageSent = false;

	let initialHeight: number;

	onMount(() => {
		initialHeight = textarea.scrollHeight;

		const storedMessages = localStorage.getItem('messages');

		if (storedMessages) messages = JSON.parse(storedMessages);
	});

	let awaitingResponse = $state(false);

	async function sendMessage() {
		if (!input || awaitingResponse) return;

		awaitingResponse = true;

		messages = [...messages, { role: 'user', content: [{ type: 'text', text: input }] }];
		input = '';
		textarea.style.height = `${initialHeight}px`;

		const json: Message[] = await (
			await fetch('/api/sendMessage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(messages)
			})
		).json();

		messageSent = true;

		messages = [...messages, ...json];

		localStorage.setItem('messages', JSON.stringify(messages));

		awaitingResponse = false;
	}

	function resizeTextarea() {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	function clearChat() {
		messages = initial_messages;
		localStorage.removeItem('messages');
	}

	let showInternals = $state(false);
</script>

<main class="flex min-h-screen justify-center bg-slate-200">
	<div class="m-2 flex w-full max-w-2xl flex-col gap-2 rounded p-2">
		<h1 class="my-2 text-3xl font-light tracking-tight">AVHS Library Book Search</h1>
		<button onclick={clearChat} class="mx-auto w-fit underline">Clear chat</button>
		<label>
			<input type="checkbox" bind:checked={showInternals} />
			Show internals
		</label>
		{#each messages as message}
			<div class="flex" transition:fade>
				{#if (message.role === 'user' || message.role === 'assistant') && message.content}
					{#each message.content as content}
						{#if message.role === 'assistant'}
							<div
								class="w-fit max-w-lg overflow-hidden break-words rounded-3xl bg-slate-300 px-5 py-2"
							>
								<SvelteMarkdown source={content.text} />
							</div>
						{:else}
							<div
								class="ml-auto w-fit max-w-lg overflow-hidden break-words rounded-3xl bg-slate-800 px-5 py-2 text-right text-white"
							>
								{content.text}
							</div>
						{/if}
					{/each}
				{:else if showInternals}
					{#if message.role === 'system'}
						{#each message.content as content}
							<div class="ml-auto">
								<div class="ml-5 text-xs font-light italic">System prompt</div>
								<div
									class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
								>
									{content.text}
								</div>
							</div>
						{/each}
					{:else if message.role === 'assistant' && 'tool_calls' in message}
						{#each message.tool_calls as tool_call}
							<div>
								<span class="ml-5 text-xs font-light italic">Database query</span>
								<div
									class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
								>
									{JSON.parse(tool_call.function.arguments).query}
								</div>
							</div>
						{/each}
					{:else if message.role === 'tool'}
						{#each message.content as content}
							<div class="ml-auto">
								<div class="ml-5 text-xs font-light italic">Database response</div>
								<div
									class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
								>
									{content.text}
								</div>
							</div>
						{/each}
					{/if}
				{/if}
			</div>
		{/each}
		<div class="flex w-full gap-2">
			<textarea
				bind:value={input}
				bind:this={textarea}
				onkeydown={(event) => {
					if (event.key !== 'Enter') return;

					event.preventDefault();

					sendMessage();
				}}
				oninput={resizeTextarea}
				class="bg-slate-1300 w-full resize-none rounded-3xl px-5 py-2"
				rows="1"
				placeholder="Type a message..."
			></textarea>
			<div class="flex items-end">
				<button
					onclick={sendMessage}
					class={`w-fit rounded-3xl ${awaitingResponse ? 'cursor-wait bg-slate-500' : 'bg-slate-800'} p-1 text-white`}
					aria-label="Send message"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="icon-2xl"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
							fill="currentColor"
						></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
</main>
