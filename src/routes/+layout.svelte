<script>
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import '../app.css';
	const { children, data } = $props();
	const loggedin = $derived(!!data?.username);
</script>

<svelte:head>
	<title>Warbands</title>
</svelte:head>

<header class="site-header">
	<div class="header-inner">
		<a class="brand" href={resolve('/')} aria-label="Warbands home">
			<img class="brand-mark" src={asset('bonfire.png')} alt="" />
			<span>Warbands</span>
		</a>
		<nav aria-label="Main navigation">
			<a href={resolve('/')} aria-current={page.url.pathname === '/' ? 'page' : undefined}>Home</a>
			{#if loggedin}
				<a
					href={resolve('/warband')}
					aria-current={page.url.pathname === '/warband' ? 'page' : undefined}
					data-sveltekit-preload-data={false}>Warband</a
				>
			{/if}
			<a href={resolve('/about')} aria-current={page.url.pathname === '/about' ? 'page' : undefined}
				>About</a
			>
		</nav>
		{#if loggedin}
			<form method="POST" action={resolve('/logout')}>
				<button type="submit">Log out <span aria-hidden="true">&#8599;</span></button>
			</form>
		{/if}
	</div>
</header>

<main class="site-main">
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		background: #101113;
		color: #ece9e1;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	.site-header {
		border-bottom: 1px solid #302c27;
		background: #171718;
	}

	.header-inner {
		display: flex;
		align-items: center;
		gap: 3rem;
		width: min(100% - 3rem, 1440px);
		min-height: 72px;
		margin: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		color: #f2eee6;
		font-family: Georgia, serif;
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		text-decoration: none;
		white-space: nowrap;
	}

	.brand-mark {
		width: 32px;
		height: 32px;
		object-fit: contain;
	}

	nav {
		display: flex;
		align-self: stretch;
		gap: 1.75rem;
	}

	nav a {
		display: flex;
		align-items: center;
		border-bottom: 2px solid transparent;
		color: #aaa59c;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
	}

	nav a:hover,
	nav a[aria-current='page'] {
		color: #f1e2ca;
	}

	nav a[aria-current='page'] {
		border-bottom-color: #c4975a;
	}

	form {
		margin-left: auto;
	}

	button {
		border: 1px solid #46403a;
		border-radius: 6px;
		padding: 0.55rem 0.8rem;
		background: transparent;
		color: #d4cdc1;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	button:hover {
		border-color: #a1835b;
		color: #fff;
	}

	button span {
		margin-left: 0.35rem;
		color: #b18b5c;
	}

	.site-main {
		width: min(100% - 3rem, 1440px);
		margin: 0 auto;
	}

	.site-main :global(a) {
		color: #e2bd87;
	}

	@media (max-width: 600px) {
		.header-inner {
			width: min(100% - 2rem, 1440px);
			min-height: 64px;
			gap: 1rem;
			flex-wrap: wrap;
			padding-top: 0.75rem;
		}

		nav {
			order: 3;
			width: 100%;
			gap: 1.5rem;
			min-height: 40px;
		}

		.site-main {
			width: min(100% - 2rem, 1440px);
		}
	}
</style>
