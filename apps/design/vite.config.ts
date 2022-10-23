import { whyframe } from '@whyframe/core';
import { whyframeJsx } from '@whyframe/jsx';
import solid from 'solid-start/vite';
import UnoCss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		whyframe({ components: [{ name: 'Story', showSource: true }], defaultSrc: '/iframe' }),
		whyframeJsx({ defaultFramework: 'solid' }),
		UnoCss(),
		solid(),
	],
	ssr: {
		external: ['shiki'],
	},
});
