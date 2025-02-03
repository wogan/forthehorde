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

	const chars = data.characters.sort((a, b) => b.level - a.level);
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
			{#each chars as c}
				<tr>
					<td><img src={c.media?.avatar} alt="" class="icon" />{c.name}</td>
					<td>{c.realm}</td>
					<td class={slugify(c.cls)}><img src={icon(c)} alt="" class="icon" />{c.cls}</td>
					<td>{c.race}</td>
					<td>{c.level}</td>
					<td>{c.gender}</td>
					<td>{c.faction}</td>
					<td>{c.spec}</td>
					<td>{c.guild}</td>
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
