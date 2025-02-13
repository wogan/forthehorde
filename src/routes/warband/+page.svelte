<script lang="ts">
	import { Character, slugify } from '$lib/model';
	import classIcons from '$lib/data/classes.json';
	import { browser } from '$app/environment';

	const icon = (c: Character): string | null => {
		const slug = slugify(c.cls);
		return (classIcons as Record<string, string>)[slug];
	};

	const MAX_LEVEL = 80;

	let { data } = $props();

	let warband = $state<HTMLImageElement[]>([]);

	let canvas: HTMLCanvasElement | undefined = $state();

	let maxLevelCount = $derived(data.characters.filter((c) => c.level == MAX_LEVEL).length);

	let accounts = $derived(data.accounts);

	const chars = $derived(data.characters.sort((a, b) => b.level - a.level));

	if (browser) {
		data.characters
			.filter((c) => c.level == MAX_LEVEL)
			.slice(0, 4)
			.forEach((c, i) =>
				c.media
					.then((media) => loadImage(media.main))
					.then((img) => (warband[i] = img))
					.catch(console.log)
			);
	}

	const loadImage = (url: string): Promise<HTMLImageElement> => {
		if (browser) {
			return new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error(`load ${url} fail`));
				img.src = url;
			});
		} else {
			return Promise.reject('not on server');
		}
	};

	$effect(() => {
		const context = canvas?.getContext('2d') ?? null;
		if (context == null) {
			return;
		}
		warband.forEach((img, i) => {
			context.drawImage(img, (i - 1) * 160 + 40, -30, 400, 300);
		});
	});
</script>

<p>You have {accounts?.length} accounts.</p>

{#if data.characters.length > 0}
	{#if maxLevelCount > 0}
		<p>You have {maxLevelCount} max level characters! Good job</p>
		<canvas bind:this={canvas} width="800" height="240"></canvas>
	{/if}

	<p>All Characters</p>

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
					<td>
						{#await c.media then media}
							<img src={media.avatar} alt="" class="icon" />
						{/await}
						{c.name}
					</td>
					<td>{c.realm}</td>
					<td class={slugify(c.cls)}><img src={icon(c)} alt="" class="icon" />{c.cls}</td>
					<td>{c.race}</td>
					<td>{c.level}</td>
					<td>{c.gender}</td>
					<td>{c.faction}</td>
					{#await c.extra}
						<td></td><td></td>
					{:then extra}
						<td>{extra.spec}</td>
						<td>{extra.guild}</td>
					{/await}
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
