<script lang="ts">
	let { data } = $props();
	let username = data?.username;
	let redirecting = $state(false);
	// TODO: make the redirect flow a bit more interactive/responsive
</script>

{#if !!username}
	<p>Welcome back {username}</p>
	<!-- get list of characters, sort by level desc, last login desc and take top 4 -->
	<p>View your <a href="/warband">warband</a></p>
{:else}
	<p>Track all of your WoW characters in one place.</p>
	{#if !redirecting}
		<p><a href="/auth" onclick={() => (redirecting = true)}>Login with Battle.net</a></p>
	{:else}
		<p>Loading</p>
	{/if}
{/if}
