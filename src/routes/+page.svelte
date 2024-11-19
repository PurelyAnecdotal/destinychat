<script lang="ts">
	let { data } = $props();

	console.log(data);
</script>

<h1>DestinyChat</h1>

<div class="m-2 flex max-w-md flex-col gap-2 rounded bg-slate-200 p-2">
	<div class="w-fit rounded bg-slate-300 p-2">asdf</div>
	<div class="ml-auto w-fit rounded bg-slate-800 p-2 text-white">asdf</div>
	<div class="flex rounded bg-slate-300 p-2">
		<input class="w-full bg-slate-1300" />
		<button class="w-fit rounded bg-slate-800 p-2 text-white">Send</button>
	</div>
</div>

{data.count} books
