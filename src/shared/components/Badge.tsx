import clsx from 'clsx';
import { type JSXElement } from 'solid-js';

type BadgeType = 'info' | 'warn';

const BADGE_ICON = {
	info: 'i-lucide-info',
	warn: 'i-lucide-alert-circle',
} as const satisfies Record<BadgeType, string>;

const BADGE_ARIA = {
	info: '',
	warn: '',
} as const satisfies Record<BadgeType, string>;

export const Badge = (props: { children: JSXElement; type: BadgeType }) => (
	<div class="bg-accent text-contrast flex flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm">
		<i class={clsx(BADGE_ICON[props.type], 'font-600 text-xl')} aria-label={BADGE_ARIA[props.type]} />
		{props.children}
	</div>
);
