import solid from 'solid-start/vite';
import UnoCss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			treeshake: 'smallest',
		},
	},
	plugins: [UnoCss(), solid()],
	ssr: {
		external: ['@prisma/client'],
	},
});
