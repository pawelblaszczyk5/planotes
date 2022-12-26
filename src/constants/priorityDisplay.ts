import { type Priority } from '@prisma/client';

export const PRIORITY_ICONS = {
	HIGH: 'i-lucide-signal',
	LOW: 'i-lucide-signal-medium',
	MEDIUM: 'i-lucide-signal-high',
} as const satisfies Record<Priority, string>;

export const PRIORITY_TEXT = {
	HIGH: 'High',
	LOW: 'Low',
	MEDIUM: 'Medium',
} as const satisfies Record<Priority, string>;
