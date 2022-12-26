import { type CompletableStatus } from '@prisma/client';

export const STATUS_LABEL = {
	ARCHIVED: 'Archived',
	COMPLETED: 'Completed',
	IN_PROGRESS: 'In progress',
	TO_DO: 'To do',
} as const satisfies Record<CompletableStatus, string>;

export const AVAILABLE_TRANSITIONS = {
	ARCHIVED: [],
	COMPLETED: [],
	IN_PROGRESS: ['COMPLETED', 'TO_DO', 'ARCHIVED'],
	TO_DO: ['IN_PROGRESS', 'COMPLETED', 'ARCHIVED'],
} as const satisfies Record<CompletableStatus, ReadonlyArray<CompletableStatus>>;

export const STATUS_ICON = {
	ARCHIVED: 'i-lucide-archive',
	COMPLETED: 'i-lucide-check-circle',
	IN_PROGRESS: 'i-lucide-arrow-left-right',
	TO_DO: 'i-lucide-bed',
} as const satisfies Record<CompletableStatus, string>;
