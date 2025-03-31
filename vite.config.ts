import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { triggerkit } from 'triggerkit';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		triggerkit({
			includeDirs: ['src/lib']
		})],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
