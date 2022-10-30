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
	shortcuts: {
		'bg-primary': 'bg-neutral-200 dark:bg-neutral-900',
		'text-primary': 'text-neutral-900 dark:text-neutral-200',
	},
});
