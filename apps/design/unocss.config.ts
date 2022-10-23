import { defineConfig, presetIcons, presetWind } from 'unocss';

export default defineConfig({
	include: ['src/**/*.tsx', /.+\/ui\/.+\.jsx$/u],
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
		'bg-primary': 'bg-neutral-200 dark:bg-neutral-800',
		'text-primary': 'text-neutral-800 dark:text-neutral-200',
	},
});
