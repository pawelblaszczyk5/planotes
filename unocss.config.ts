import { defineConfig, presetIcons, presetWind } from 'unocss';

export default defineConfig({
	presets: [
		presetWind(),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
			},
		}),
	],
});
