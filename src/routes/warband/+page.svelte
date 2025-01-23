<script lang="ts">
	import { Character } from '$lib/model';
	import { characterAchievements } from 'blizzard.js/dist/resources/wow.js';

	let { data } = $props();
</script>

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

<style>
	@import './style.css';
</style>
