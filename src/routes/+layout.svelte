<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Warbands</title>
</svelte:head>

<h1>Warbands</h1>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
</nav>

{@render children()}
