import { type Module } from '~/types';

export const MODULE_ICONS = {
	goals: 'i-lucide-compass',
	home: 'i-lucide-home',
	notes: 'i-lucide-sticky-note',
	shop: 'i-lucide-coins',
	tasks: 'i-lucide-clipboard-check',
} as const satisfies Record<Module, string>;
