<script>
	import { resolve } from '$app/paths';
	import '../app.css';
	const { children, data } = $props();
	const loggedin = $derived(!!data?.username);
</script>

<svelte:head>
	<title>Warbands</title>
</svelte:head>

<h1>Warbands</h1>

<nav>
	<a href={resolve('/')}>Home</a>
	{#if loggedin}<a href={resolve('/warband')} data-sveltekit-preload-data={false}>Warband</a>{/if}
	<a href={resolve('/about')}>About</a>
	{#if loggedin}<a href={resolve('/logout')}>Logout</a>{/if}
</nav>

{@render children()}
