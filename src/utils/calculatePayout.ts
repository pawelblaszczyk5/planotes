import { Size } from '@prisma/client';

type PayoutType = 'goal' | 'task';

const BASE_PRIZE = 100;

const TYPE_MULTIPLIER = {
	goal: 2.5,
	task: 1,
} as const satisfies Record<PayoutType, number>;

const SIZE_MULTIPLIER = {
	[Size.XS]: 0.25,
	[Size.S]: 0.5,
	[Size.M]: 1,
	[Size.L]: 1.5,
	[Size.XL]: 1.75,
} as const satisfies Record<Size, number>;

export const calculatePayout = (type: PayoutType, size: Size) =>
	Math.round(BASE_PRIZE * TYPE_MULTIPLIER[type] * SIZE_MULTIPLIER[size]);
