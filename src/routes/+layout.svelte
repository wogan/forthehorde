<script>
	import '../app.css';
	const { children, data } = $props();
	const username = data?.username;
	const loggedin = !!data?.username;
</script>

<svelte:head>
	<title>Warbands</title>
</svelte:head>

<h1>Warbands</h1>

<nav>
	<a href="/">Home</a>
	{#if loggedin}<a href="/warband">Warband</a>{/if}
	<a href="/about">About</a>
	{#if loggedin}<a href="/logout">Logout</a>{/if}
</nav>

{@render children()}
