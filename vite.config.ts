// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />

import solid from 'solid-start/vite';
import UnoCss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	define: {
		'import.meta.vitest': 'undefined',
	},
	plugins: [UnoCss(), solid()],
	ssr: {
		external: ['@prisma/client'],
	},
	test: {
		includeSource: ['src/**/*.{tsx,ts}'],
	},
});
