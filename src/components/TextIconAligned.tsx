import { type JSXElement } from 'solid-js';

type TextAlignedIconProps = {
	children: JSXElement;
	icon: string;
};

export const TextAlignedIcon = (props: TextAlignedIconProps) => (
	<span class="inline-flex items-center gap-1">
		<i class={props.icon} />
		<span>{props.children}</span>
	</span>
);
