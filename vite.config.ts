import solid from 'solid-start/vite';
import UnoCss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [UnoCss(), solid()],
	ssr: {
		external: ['@prisma/client'],
	},
});
