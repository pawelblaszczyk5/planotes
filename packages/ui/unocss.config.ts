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
		'b-primary': 'b-neutral-300 dark:b-neutral-700',
		'bg-primary': 'bg-neutral-200 dark:bg-neutral-900',
		'ring-primary': 'outline-none ring-sky-600 focus-visible:ring-2 dark:ring-sky-400',
		'text-primary': 'text-neutral-900 dark:text-neutral-200',
		'text-secondary': 'text-neutral-700 dark:text-neutral-400',
	},
});
