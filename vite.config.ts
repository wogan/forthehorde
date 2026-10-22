import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { triggerkit } from 'triggerkit';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			compilerOptions: {
				runes: true
			},
			preprocess: vitePreprocess()
		}),
		tailwindcss(),
		triggerkit({
			includeDirs: ['src/lib']
		})
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
