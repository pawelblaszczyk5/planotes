import { variantMatcher } from '@unocss/preset-mini/utils';
import { defineConfig, presetIcons, presetWind, presetTypography } from 'unocss';

export default defineConfig({
	include: ['**/*.{ts,tsx}'],
	presets: [
		presetWind(),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
			},
		}),
		presetTypography(),
	],
	shortcuts: {
		'b-accent': 'b-fuchsia-600 dark:b-fuchsia-400',
		'b-destructive': 'b-rose-600 dark:b-rose-500',
		'b-primary': 'b-neutral-400 dark:b-neutral-600',
		'bg-accent': 'bg-fuchsia-600 dark:bg-fuchsia-400',
		'bg-primary': 'bg-neutral-200 dark:bg-neutral-900',
		'bg-secondary': 'bg-neutral-100 dark:bg-neutral-800',
		'ring-primary': 'outline-sky-600 focus-visible:outline-2 focus-visible:outline-solid dark:outline-sky-400',
		'ring-primary-force': 'outline-sky-600 outline-2 outline-solid dark:outline-sky-400',
		'text-accent': 'text-fuchsia-600 dark:text-fuchsia-400',
		'text-contrast': 'text-neutral-200 dark:text-neutral-900',
		'text-destructive': 'text-rose-600 dark:text-rose-500',
		'text-primary': 'text-neutral-900 dark:text-neutral-200',
		'text-secondary': 'text-neutral-600 dark:text-neutral-400',
	},
	variants: [
		// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
		// @ts-ignore - there is something strange with this error
		variantMatcher('pointer', input => {
			return {
				parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
				selector: `${input.selector || ''}`,
			};
		}),
	],
});
