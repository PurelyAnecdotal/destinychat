<script lang="ts">
	import type { Message } from 'ai';
	import SvelteMarkdown from 'svelte-markdown';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();
</script>

{#if message.role === 'assistant'}
	{#if message.content}
		<div class="w-fit max-w-lg overflow-hidden break-words rounded-3xl bg-slate-300 px-5 py-2">
			<SvelteMarkdown source={message.content} />
		</div>
	{/if}

	{#if message.toolInvocations}
		{#each message.toolInvocations as toolInvocation}
			<div>
				<span class="ml-5 text-xs font-light italic">Database query</span>
				<div
					class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
				>
					{toolInvocation.args.query}
				</div>
			</div>

			{#if 'result' in toolInvocation}
				<div class="ml-auto mt-2 w-fit">
					<div class="ml-5 text-xs font-light italic">Database response</div>
					<div
						class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
					>
						{JSON.stringify(toolInvocation.result)}
					</div>
				</div>
			{/if}
		{/each}
	{/if}
{:else if message.role === 'user'}
	<div
		class="ml-auto w-fit max-w-lg overflow-hidden break-words rounded-3xl bg-slate-800 px-5 py-2 text-right text-white"
	>
		{message.content}
	</div>
{:else if message.role === 'system'}
	<div class="ml-auto w-fit">
		<div class="ml-5 text-xs font-light italic">System prompt</div>
		<div
			class="w-fit max-w-lg overflow-hidden break-words rounded-3xl border-2 border-slate-300 px-5 py-2 font-mono text-xs"
		>
			{message.content}
		</div>
	</div>
{/if}
