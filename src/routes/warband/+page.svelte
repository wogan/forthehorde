<script lang="ts">
	import { Character } from '$lib/model';
	import { characterAchievements } from 'blizzard.js/dist/resources/wow.js';

	let { data } = $props();
</script>

<table>
	<thead>
		<tr>
			<td>Name</td>
			<td>Class</td>
			<td>Race</td>
			<td>Level</td>
			<td>Gender</td>
			<td>Faction</td>
			<td>Spec</td>
			<td>Guild</td>
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
