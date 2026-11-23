<script lang="ts">
	import { Character, slugify } from '#lib/model.ts';
	import classIcons from '#lib/data/classes.json';
	import Media from './media.svelte';

	const icon = (c: Character): string | undefined => {
		const slug = slugify(c.cls);
		return (classIcons as Record<string, string>)[slug];
	};

	const MAX_LEVEL = 90;

	let { data } = $props();

	let maxLevelCount = $derived(data.characters.filter((c) => c.level === MAX_LEVEL).length);
	let chars = $derived([...data.characters].sort((a, b) => b.level - a.level));
</script>

<div class="warband">
	<header class="page-header">
		<div>
			<p class="eyebrow"><span aria-hidden="true"></span> Your collection</p>
			<h1>Your warband<span class="heading-dot">.</span></h1>
			<p class="intro">All your adventures, gathered in one place.</p>
		</div>
		<div class="summary" aria-label="Warband summary">
			<div class="summary-item">
				<span class="summary-value">{data.characters.length}</span>
				<span class="summary-label">Characters</span>
			</div>
			{#if data.accountCount !== null}
				<div class="summary-item">
					<span class="summary-value">{data.accountCount}</span>
					<span class="summary-label">{data.accountCount === 1 ? 'Account' : 'Accounts'}</span>
				</div>
			{/if}
			{#if maxLevelCount > 0}
				<div class="summary-item">
					<span class="summary-value">{maxLevelCount}</span>
					<span class="summary-label">Max level</span>
				</div>
			{/if}
		</div>
	</header>

	{#if data.unavailableDetailsCount > 0}
		<div class="notice" role="status">
			<span class="notice-icon" aria-hidden="true">!</span>
			<p>
				<strong>Some details are unavailable.</strong>
				Blizzard did not return all details for {data.unavailableDetailsCount}
				{data.unavailableDetailsCount === 1 ? 'character' : 'characters'}. Previously saved details
				were kept.
			</p>
		</div>
	{/if}

	{#if data.characters.length > 0}
		{#if maxLevelCount > 0}
			<section class="featured" aria-label="Featured characters">
				<div>
					<p class="eyebrow">The journey continues</p>
					<h2>At the top of their game</h2>
					<p>
						{maxLevelCount}
						{maxLevelCount === 1 ? 'character has' : 'characters have'} reached max level.
					</p>
				</div>
				<div class="featured-media"><Media characters={chars.slice(0, 4)} /></div>
			</section>
		{/if}

		<section class="roster" aria-labelledby="roster-heading">
			<div class="roster-heading">
				<div>
					<p class="eyebrow">Your characters</p>
					<h2 id="roster-heading">The roster <span>{data.characters.length}</span></h2>
				</div>
				<p>Sorted by level <span class="scroll-hint"> &middot; Scroll for more details</span></p>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="table-wrap" role="region" aria-label="Character roster" tabindex="0">
				<table>
					<thead>
						<tr>
							<th scope="col">Character</th>
							<th scope="col">Class &amp; specialization</th>
							<th scope="col">Race</th>
							<th scope="col">Level</th>
							<th scope="col">Faction</th>
							<th scope="col">Guild</th>
						</tr>
					</thead>
					<tbody>
						{#each chars as c (c.id)}
							<tr>
								<td>
									<div class="character">
										{#await c.media then media}
											{#if media.avatar}
												<img src={media.avatar} alt="" class="avatar" loading="lazy" />
											{:else}
												<span class="avatar avatar-placeholder" aria-hidden="true"
													>{c.name.charAt(0)}</span
												>
											{/if}
										{:catch}
											<span class="avatar avatar-placeholder" aria-hidden="true"
												>{c.name.charAt(0)}</span
											>
										{/await}
										<div class="character-name">
											<strong>{c.name}</strong>
											<span>{c.realm}</span>
										</div>
									</div>
								</td>
								<td>
									<div class="class-name">
										{#if icon(c)}<img src={icon(c)} alt="" class="class-icon" loading="lazy" />{/if}
										<div>
											<span class={slugify(c.cls)}>{c.cls}</span>
											{#await c.extra}
												<span class="subtext">-</span>
											{:then extra}
												<span class="subtext">{extra.spec || '-'}</span>
											{:catch}
												<span class="subtext">-</span>
											{/await}
										</div>
									</div>
								</td>
								<td><span class="race">{c.race}</span><span class="subtext">{c.gender}</span></td>
								<td><span class="level">{c.level}</span></td>
								<td><span class={['faction', c.faction.toLowerCase()]}>{c.faction}</span></td>
								{#await c.extra}
									<td class="muted">-</td>
								{:then extra}
									<td class={{ muted: !extra.guild }}>{extra.guild || '-'}</td>
								{:catch}
									<td class="muted">-</td>
								{/await}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{:else}
		<section class="empty-state">
			<p class="eyebrow">Your characters</p>
			<h2>Your roster is empty</h2>
			<p>No characters found. Have you logged into World of Warcraft in the last 30 days?</p>
		</section>
	{/if}
</div>

<style>
	.warband {
		padding: 3.75rem 0 6rem;
	}

	.page-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: 0 0 0.8rem;
		color: #c99f67;
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.eyebrow span {
		width: 22px;
		height: 1px;
		background: #c99f67;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1,
	h2 {
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 400;
		letter-spacing: -0.035em;
	}

	h1 {
		font-size: clamp(2.8rem, 5vw, 4.2rem);
		line-height: 1.05;
	}

	.heading-dot {
		color: #c99f67;
	}

	.intro {
		margin-top: 0.9rem;
		color: #a49e94;
		font-size: 0.95rem;
	}

	.summary {
		display: flex;
		gap: 0;
		padding-bottom: 0.15rem;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 105px;
		padding: 0 1.5rem;
		border-left: 1px solid #3c3730;
	}

	.summary-value {
		color: #f0e9de;
		font-family: Georgia, serif;
		font-size: 1.75rem;
		line-height: 1;
	}

	.summary-label {
		color: #938c80;
		font-size: 0.7rem;
		font-weight: 650;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.notice {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		margin-bottom: 2rem;
		padding: 1rem 1.15rem;
		border: 1px solid #5b4931;
		border-radius: 8px;
		background: #282219;
		color: #c8b99f;
		font-size: 0.83rem;
		line-height: 1.55;
	}

	.notice strong {
		color: #e5c998;
	}

	.notice-icon {
		display: grid;
		flex: 0 0 20px;
		height: 20px;
		place-items: center;
		border: 1px solid #a87d45;
		border-radius: 50%;
		color: #e2b87d;
		font-weight: 700;
	}

	.featured,
	.empty-state,
	.roster {
		overflow: hidden;
		border: 1px solid #393630;
		border-radius: 10px;
		background: #1a1b1c;
	}

	.featured {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2rem;
		padding: 1.5rem 1.75rem;
		background: linear-gradient(110deg, #29231d, #1a1b1c 70%);
	}

	.featured h2,
	.empty-state h2 {
		font-size: 1.65rem;
	}

	.featured p:not(.eyebrow),
	.empty-state > p:last-child {
		margin-top: 0.6rem;
		color: #a9a094;
		font-size: 0.85rem;
	}

	.featured-media {
		width: min(45%, 400px);
	}

	.featured-media :global(canvas) {
		display: block;
		width: 100%;
		height: auto;
	}

	.roster-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.6rem 1.75rem 1.4rem;
	}

	.roster-heading h2 {
		font-size: 1.8rem;
	}

	.roster-heading h2 span {
		display: inline-block;
		margin-left: 0.4rem;
		padding: 0.2rem 0.45rem;
		border: 1px solid #4b4235;
		border-radius: 4px;
		color: #c8ad85;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0;
		vertical-align: middle;
	}

	.roster-heading > p {
		color: #837e76;
		font-size: 0.75rem;
		text-align: right;
	}

	.scroll-hint {
		display: none;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	thead {
		background: #20201f;
	}

	th {
		padding: 0.8rem 1rem;
		border-top: 1px solid #35332f;
		border-bottom: 1px solid #35332f;
		color: #999187;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	td {
		padding: 0.8rem 1rem;
		border-bottom: 1px solid #2d2c2a;
		color: #c8c3ba;
		font-size: 0.8rem;
		white-space: nowrap;
	}

	th:first-child,
	td:first-child {
		padding-left: 1.75rem;
	}

	th:last-child,
	td:last-child {
		padding-right: 1.75rem;
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	tbody tr:hover {
		background: #242321;
	}

	.character,
	.class-name {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.avatar {
		display: grid;
		width: 42px;
		height: 42px;
		flex: 0 0 42px;
		place-items: center;
		border: 1px solid #51473a;
		border-radius: 6px;
		background: #302c27;
		object-fit: cover;
	}

	.avatar-placeholder {
		color: #c4a780;
		font-family: Georgia, serif;
		font-size: 1.1rem;
	}

	.character-name strong,
	.character-name span,
	.subtext {
		display: block;
	}

	.character-name strong {
		color: #eee9df;
		font-size: 0.875rem;
	}

	.character-name span,
	.subtext {
		margin-top: 0.2rem;
		color: #8e887e;
		font-size: 0.72rem;
	}

	.class-icon {
		width: 22px;
		height: 22px;
		border-radius: 4px;
	}

	.level {
		color: #e7d2ac;
		font-weight: 700;
	}

	.faction {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: #2d2926;
		color: #c5b9ab;
		font-size: 0.7rem;
		font-weight: 650;
	}

	.faction.horde {
		background: #362322;
		color: #e39b8d;
	}

	.faction.alliance {
		background: #222e3b;
		color: #9dbddd;
	}

	.muted {
		color: #77736c;
	}

	.empty-state {
		padding: 2rem;
	}

	@media (max-width: 1000px) {
		.scroll-hint {
			display: inline;
		}
	}

	@media (max-width: 700px) {
		.warband {
			padding-top: 2.5rem;
		}

		.page-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.summary-item:first-child {
			padding-left: 0;
			border-left: 0;
		}

		.featured {
			align-items: flex-start;
			flex-direction: column;
		}

		.featured-media {
			width: 100%;
		}

		.roster-heading {
			padding: 1.3rem;
		}

		th:first-child,
		td:first-child {
			padding-left: 1.3rem;
		}
	}
</style>
