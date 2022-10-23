import path from 'node:path';
import UnoCss from 'unocss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [UnoCss(), solidPlugin()],
	resolve: {
		alias: {
			'~': path.join(process.cwd(), 'src'),
		},
	},
});
