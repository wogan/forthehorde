import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			compilerOptions: {
				runes: true
			},
			preprocess: vitePreprocess()
		}),
		tailwindcss()
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
