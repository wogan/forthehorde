<script lang="ts">
	import { Character, slugify } from '$lib/model';
	import classIcons from '$lib/data/classes.json';

	const icon = (c: Character): string | null => {
		const slug = slugify(c.cls);
		return (classIcons as Record<string, string>)[slug];
	};

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
					<td class={slugify(character.cls)}
						><img src={icon(character)} alt="" class="icon" />{character.cls}</td
					>
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
	img.icon {
		width: 16px;
		height: 16px;
		display: inline-block;
		margin-right: 2px;
	}
	td {
		padding: 1px 5px;
	}
</style>
