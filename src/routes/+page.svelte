<svelte:options runes={false} />

<script lang="ts">
	import { useChat } from '@ai-sdk/svelte';
	import { type Message } from 'ai';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MessageBubble from './MessageBubble.svelte';

	let textarea: HTMLTextAreaElement;

	let initialHeight: number;

	let initialMessages: Message[] = [
		{
			role: 'system',
			content:
				'You are a helpful library assistant who helps people with finding a book in a database by making SQL queries. The table is named "books" and has the columns "barcode", "call_number", "sublocation" (often is blank), "author", "subject", "title", "description" (used to specify when books are divided into volumes, usually blank), and "copies" (the same book may have multiple entries but with a different copies number for each copy of the book). Make sure your queries do not return more than 20 results. Don\'t use ILIKE. Author field is of the format "Last name, First name." (including trailing period) If you are providing a list of books, put a horizontal rule between each book, and do not show the barcode and number of copies unless asked. Put the title first in bold, and then list the rest of the properties afterward in regular text. If a field is blank, simply omit it. If a database response returns results that contain non-book items, please omit them. If a book is listed multiple times, just list it once and include how many copies are in the database.',
			id: 'system'
		},
		{
			role: 'assistant',
			content: 'Hello! What are you looking for in the library database?',
			id: 'initial'
		}
	];

	const { input, handleSubmit, messages, isLoading, setMessages } = useChat({
		initialMessages,
		maxSteps: 5
	});

	onMount(() => {
		initialHeight = textarea.scrollHeight;

		const storedMessages = localStorage.getItem('messages');

		if (storedMessages) setMessages(JSON.parse(storedMessages));

		messages.subscribe((value) => {
			console.log(value);
			localStorage.setItem('messages', JSON.stringify(value));
		});
	});

	function resizeTextarea() {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	let showInternals = false;

	function clearChat() {
		setMessages(initialMessages);

		localStorage.removeItem('messages');
	}

	function isVisibleMessage(message: Message) {
		return message.role !== 'system' && !(message.role === 'assistant' && message.toolInvocations);
	}

	messages.subscribe((value) => {
		console.log(value[value.length - 1].content);
	});
</script>

<main class="flex min-h-screen justify-center bg-slate-200">
	<div class="m-2 flex w-full max-w-2xl flex-col gap-2 rounded p-2">
		<h1 class="my-2 text-3xl font-light tracking-tight">AVHS Library Book Search</h1>
		<button onclick={clearChat} class="mx-auto w-fit underline">Clear chat</button>
		<label>
			<input type="checkbox" bind:checked={showInternals} />
			Show internals
		</label>
		<ol class="space-y-2">
			{#each $messages as message}
				{#if showInternals || isVisibleMessage(message)}
					<li transition:fade={{ duration: 150 }}>
						<MessageBubble {message} />
					</li>
				{/if}
			{/each}
		</ol>
		<div class="flex w-full gap-2">
			<textarea
				bind:value={$input}
				bind:this={textarea}
				onkeydown={(event) => {
					if (event.key !== 'Enter') return;

					event.preventDefault();

					handleSubmit();
				}}
				oninput={resizeTextarea}
				class="bg-slate-1300 w-full resize-none rounded-3xl px-5 py-2"
				rows="1"
				placeholder="Type a message..."
			></textarea>
			<div class="flex items-end">
				<button
					onclick={handleSubmit}
					class={`w-fit rounded-3xl ${$isLoading ? 'cursor-wait bg-slate-500' : 'bg-slate-800'} p-1 text-white`}
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
