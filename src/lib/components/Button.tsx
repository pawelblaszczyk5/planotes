import { Motion } from '@motionone/solid';
import { type JSXElement } from 'solid-js';

type ButtonProps = {
	children: JSXElement;
	onClick?: () => void;
	type?: 'button' | 'reset' | 'submit';
	variant?: 'destructive' | 'primary' | 'secondary';
};

export const Button = (props: ButtonProps) => {
	return (
		<Motion.button
			press={{ scale: 0.95 }}
			class="ring-primary b-2 rounded-sm py-2 px-6 font-medium outline-offset-2"
			classList={{
				'b-accent': props.variant === 'primary' || !props.variant,
				'b-destructive': props.variant === 'destructive',
				'b-primary': props.variant === 'secondary',
			}}
			type={props.type ?? 'submit'}
			onClick={() => props.onClick?.()}
		>
			{props.children}
		</Motion.button>
	);
};
