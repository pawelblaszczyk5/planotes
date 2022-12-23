import { Motion } from '@motionone/solid';
import clsx from 'clsx';
import { mergeProps, type JSXElement } from 'solid-js';
import { type DefaultProps } from '~/types';

type ButtonProps = {
	children: JSXElement;
	class?: string;
	onClick?: () => void;
	size?: 'normal' | 'small';
	type?: 'button' | 'reset' | 'submit';
	variant?: 'destructive' | 'primary' | 'secondary';
};

const DEFAULT_BUTTON_PROPS = {
	size: 'normal',
	type: 'submit',
	variant: 'primary',
} as const satisfies DefaultProps<ButtonProps>;

export const Button = (props: ButtonProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_BUTTON_PROPS, props);

	return (
		<Motion.button
			press={{ scale: 0.95 }}
			class={clsx('ring-primary b-2 rounded py-2 px-6 outline-offset-2', propsWithDefaults.class, {
				'b-accent': propsWithDefaults.variant === 'primary',
				'b-destructive': propsWithDefaults.variant === 'destructive',
				'b-primary': propsWithDefaults.variant === 'secondary',
				'text-base': propsWithDefaults.size === 'normal',
				'text-sm': propsWithDefaults.size === 'small',
			})}
			type={propsWithDefaults.type}
			onClick={() => propsWithDefaults.onClick?.()}
		>
			{propsWithDefaults.children}
		</Motion.button>
	);
};

type LinkButtonProps = Pick<ButtonProps, 'children' | 'class' | 'size' | 'variant'> & {
	external?: boolean;
	href: string;
	noScroll?: boolean;
	rel?: string;
	replace?: boolean;
	target?: string;
};

const DEFAULT_LINK_BUTTON_PROPS = {
	external: false,
	rel: '',
	replace: false,
	size: 'normal',
	target: '',
	variant: 'primary',
} as const satisfies DefaultProps<LinkButtonProps>;

export const ButtonLink = (props: LinkButtonProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_LINK_BUTTON_PROPS, props);

	const rest = () => {
		const restProps: { link?: true; replace?: true } = {};

		if (propsWithDefaults.replace) restProps.replace = true;
		if (!propsWithDefaults.external) restProps.link = true;

		return restProps;
	};

	return (
		<Motion.a
			press={{ scale: 0.95 }}
			class={clsx(
				'ring-primary bg-primary b-2 font-500 rounded py-2 px-6 text-center outline-offset-2',
				propsWithDefaults.class,
				{
					'b-accent': propsWithDefaults.variant === 'primary',
					'b-destructive': propsWithDefaults.variant === 'destructive',
					'b-primary': propsWithDefaults.variant === 'secondary',
					'text-base': propsWithDefaults.size === 'normal',
					'text-sm': propsWithDefaults.size === 'small',
				},
			)}
			href={props.href}
			target={propsWithDefaults.target}
			rel={propsWithDefaults.rel}
			{...rest()}
		>
			{propsWithDefaults.children}
		</Motion.a>
	);
};
