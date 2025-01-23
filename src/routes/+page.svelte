<script lang="ts">
	let { data } = $props();
	let username = data?.username;
</script>

{#if !!username}
	<p>Welcome back {username}</p>
	<!-- get list of characters, sort by level desc, last login desc and take top 4 -->
	<p>View your <a href="/warband">warband</a></p>
{:else}
	<p>Track all of your WoW characters in one place.</p>
	<p><a href="/auth">Login with Battle.net</a></p>
{/if}
