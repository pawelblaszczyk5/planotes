import clsx from 'clsx';
import { mergeProps, type JSXElement } from 'solid-js';
import { A } from 'solid-start';
import { type DefaultProps } from '~/types';

type LinkProps = {
	children: JSXElement;
	class?: string;
	end?: boolean;
	href: string;
};

const DEFAULT_LINK_PROPS = {
	end: false,
} as const satisfies DefaultProps<LinkProps>;

export const Link = (props: LinkProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_LINK_PROPS, props);

	return (
		<A
			class={clsx(
				'b-b-2 b-dotted b-current text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors ring-primary rounded-0.5 py-1 text-xl outline-offset-4',
				propsWithDefaults.class,
			)}
			activeClass="!text-accent"
			end={propsWithDefaults.end}
			href={propsWithDefaults.href}
		>
			{propsWithDefaults.children}
		</A>
	);
};

type LinkWithIconProps = LinkProps & {
	icon: string;
};

const DEFAULT_LINK_WITH_ICON_PROPS = {
	class: '',
	...DEFAULT_LINK_PROPS,
} as const satisfies DefaultProps<LinkWithIconProps>;

export const LinkWithIcon = (props: LinkWithIconProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_LINK_WITH_ICON_PROPS, props);

	return (
		<Link href={propsWithDefaults.href} class={propsWithDefaults.class} end={propsWithDefaults.end}>
			<span class="flex items-center">
				{propsWithDefaults.children} <i class={clsx('ml-3', props.icon)} aria-hidden />
			</span>
		</Link>
	);
};
