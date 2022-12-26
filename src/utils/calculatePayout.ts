/* eslint-disable id-length */
import { type Size } from '@prisma/client';

type PayoutType = 'goal' | 'task';

const BASE_PRIZE = 100;

const TYPE_MULTIPLIER = {
	goal: 10,
	task: 1,
} as const satisfies Record<PayoutType, number>;

const SIZE_MULTIPLIER = {
	L: 1.5,
	M: 1,
	S: 0.5,
	XL: 1.75,
	XS: 0.25,
} as const satisfies Record<Size, number>;

export const calculatePayout = (type: PayoutType, size: Size) =>
	Math.round(BASE_PRIZE * TYPE_MULTIPLIER[type] * SIZE_MULTIPLIER[size]);
