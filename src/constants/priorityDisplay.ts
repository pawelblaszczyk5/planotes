import { Priority } from '@prisma/client';

export const PRIORITY_ICONS = {
	[Priority.LOW]: 'i-lucide-signal-medium',
	[Priority.MEDIUM]: 'i-lucide-signal-high',
	[Priority.HIGH]: 'i-lucide-signal',
} as const satisfies Record<Priority, string>;

export const PRIORITY_TEXT = {
	[Priority.LOW]: 'Low',
	[Priority.MEDIUM]: 'Medium',
	[Priority.HIGH]: 'High',
} as const satisfies Record<Priority, string>;
