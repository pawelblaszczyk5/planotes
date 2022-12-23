import { CompletableStatus } from '@prisma/client';

export const STATUS_LABEL = {
	[CompletableStatus.COMPLETED]: 'Completed',
	[CompletableStatus.IN_PROGRESS]: 'In progress',
	[CompletableStatus.TO_DO]: 'To do',
	[CompletableStatus.ARCHIVED]: 'Archived',
} as const satisfies Record<CompletableStatus, string>;

export const AVAILABLE_TRANSITIONS = {
	[CompletableStatus.ARCHIVED]: [],
	[CompletableStatus.COMPLETED]: [],
	[CompletableStatus.IN_PROGRESS]: [CompletableStatus.COMPLETED, CompletableStatus.TO_DO, CompletableStatus.ARCHIVED],
	[CompletableStatus.TO_DO]: [CompletableStatus.IN_PROGRESS, CompletableStatus.COMPLETED, CompletableStatus.ARCHIVED],
} as const satisfies Record<CompletableStatus, ReadonlyArray<CompletableStatus>>;

export const STATUS_ICON = {
	[CompletableStatus.COMPLETED]: 'i-lucide-check-circle',
	[CompletableStatus.ARCHIVED]: 'i-lucide-archive',
	[CompletableStatus.TO_DO]: 'i-lucide-bed',
	[CompletableStatus.IN_PROGRESS]: 'i-lucide-arrow-left-right',
} as const satisfies Record<CompletableStatus, string>;
