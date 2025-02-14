<script lang="ts">
	import { browser } from '$app/environment';
	import type { Character } from '$lib/model';

	let { characters }: { characters: Character[] } = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let images = $state<HTMLImageElement[]>([]);

	if (browser) {
		characters.forEach((c, i) => {
			c.media
				.then((media) => loadImage(media.main))
				.then((img) => (images[i] = img))
				.catch(console.log);
		});
	}

	const loadImage = (url: string): Promise<HTMLImageElement> => {
			return new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error(`load ${url} fail`));
				img.src = url;
			});
	};

	$effect(() => {
		const context = canvas?.getContext('2d') ?? null;
		if (context == null) {
			return;
		}
		images.forEach((img, i) => {
			context.drawImage(img, (i - 1) * 160 + 40, -30, 400, 300);
		});
	});
</script>

<canvas bind:this={canvas} width="800" height="240"></canvas>
