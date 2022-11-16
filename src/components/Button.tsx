import { Motion } from '@motionone/solid';
import clsx from 'clsx';
import { mergeProps, type JSXElement } from 'solid-js';

type ButtonProps = {
	children: JSXElement;
	class?: string;
	onClick?: () => void;
	type?: 'button' | 'reset' | 'submit';
	variant?: 'destructive' | 'primary' | 'secondary';
};

const DEFAULT_BUTTON_PROPS = {
	class: '',
	type: 'submit',
	variant: 'primary',
} as const;

export const Button = (props: ButtonProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_BUTTON_PROPS, props);

	return (
		<Motion.button
			press={{ scale: 0.95 }}
			class={clsx('ring-primary b-2 rounded-sm py-2 px-6 font-medium outline-offset-2', propsWithDefaults.class, {
				'b-accent': propsWithDefaults.variant === 'primary',
				'b-destructive': propsWithDefaults.variant === 'destructive',
				'b-primary': propsWithDefaults.variant === 'secondary',
			})}
			type={propsWithDefaults.type}
			onClick={() => propsWithDefaults.onClick?.()}
		>
			{propsWithDefaults.children}
		</Motion.button>
	);
};
