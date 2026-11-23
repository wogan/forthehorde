<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let message = $state('Starting your character sync...');
	let failed = $state(false);
	let signInRequired = $state(false);
	let controller: AbortController;

	async function sync() {
		controller?.abort();
		controller = new AbortController();
		const signal = controller.signal;
		failed = false;
		signInRequired = false;
		message = 'Starting your character sync...';

		try {
			const start = await fetch(resolve('/sync/run'), { method: 'POST', signal });
			if (!start.ok) {
				const result = await start.json();
				signInRequired = start.status === 401;
				throw new Error(result.error || 'Could not start the sync.');
			}

			message = 'Syncing your characters. This may take a few minutes...';
			while (!signal.aborted) {
				const response = await fetch(resolve('/sync/run'), { signal, cache: 'no-store' });
				const result = await response.json();
				if (!response.ok || result.status === 'failed') {
					signInRequired = response.status === 401;
					throw new Error(result.error || 'Could not check the sync status.');
				}
				if (result.status === 'completed') {
					await goto(resolve('/warband'));
					return;
				}
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		} catch (error) {
			if (signal.aborted) return;
			failed = true;
			message = error instanceof Error ? error.message : 'Sync failed. Please retry.';
		}
	}

	onMount(() => {
		void sync();
		return () => controller?.abort();
	});
</script>

<h2>Syncing your warband</h2>
<p role="status">{message}</p>
{#if failed}
	{#if signInRequired}
		<a href={resolve('/auth')}>Sign in again</a>
	{:else}
		<button type="button" onclick={sync}>Retry sync</button>
	{/if}
{/if}
