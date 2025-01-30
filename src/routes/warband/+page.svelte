<script lang="ts">
	import { slug } from '$lib/model';

	const MAX_LEVEL = 80;

	let { data } = $props();

	let maxLevelCount = data.characters.filter((c) => c.level == MAX_LEVEL).length;

	let accounts = data.accounts;
</script>

<p>You have {accounts?.length} accounts.</p>

{#if data.characters.length > 0}
	{#if maxLevelCount > 0}
		<p>You have {maxLevelCount} max level characters! Good job</p>
	{/if}

	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Realm</th>
				<th>Class</th>
				<th>Race</th>
				<th>Level</th>
				<th>Gender</th>
				<th>Faction</th>
				<th>Spec</th>
				<th>Guild</th>
			</tr>
		</thead>
		<tbody>
			{#each data.characters as character}
				<tr>
					<td>{character.name}</td>
					<td>{character.realm}</td>
					<td class={slug(character.cls)}>{character.cls}</td>
					<td>{character.race}</td>
					<td>{character.level}</td>
					<td>{character.gender}</td>
					<td>{character.faction}</td>
					<td>{character.spec}</td>
					<td>{character.guild}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No characters found. Have you logged into World of Warcraft in the last 30 days?</p>
{/if}

<style>
	@import './style.css';

	table {
		color: white;
		background-color: black;
	}
	thead {
		color: goldenrod;
	}
</style>
