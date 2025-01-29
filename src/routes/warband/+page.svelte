<script lang="ts">
	const MAX_LEVEL = 80;

	let { data } = $props();

	let maxLevelCount = data.characters.filter((c) => c.level == MAX_LEVEL).length;
</script>

{#if data.characters.length > 0}
	{#if maxLevelCount > 0}
		<p>You have {maxLevelCount} max level characters! Good job</p>
	{/if}

	<table>
		<thead>
			<tr>
				<th>Name</th>
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
					<td>{character.cls}</td>
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
</style>
