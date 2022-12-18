import { type ColorScheme } from '~/shared/utils/colorScheme';

export const COLOR_SCHEME_ICON = {
	DARK: 'i-lucide-moon',
	LIGHT: 'i-lucide-sun',
	SYSTEM: 'i-lucide-laptop-2',
} as const satisfies Record<ColorScheme, string>;

export const COLOR_SCHEME_TITLE = {
	DARK: 'Change color scheme - currently dark',
	LIGHT: 'Change color scheme - currently light',
	SYSTEM: 'Change color scheme - currently system',
} as const satisfies Record<ColorScheme, string>;
