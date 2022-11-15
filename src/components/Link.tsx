import { mergeProps, type JSXElement } from 'solid-js';
import { A } from 'solid-start';

type LinkProps = {
	children: JSXElement;
	class?: string;
	end?: boolean;
	href: string;
};

const DEFAULT_LINK_PROPS = {
	class: '',
	end: true,
} as const;

export const Link = (props: LinkProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_LINK_PROPS, props);

	return (
		<A
			class="b-b-2 b-dotted b-current text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors ring-primary [[aria-current]&]:text-accent rounded-0.5 py-1 text-xl outline-offset-4"
			end={propsWithDefaults.end}
			href={propsWithDefaults.href}
			classList={{ [propsWithDefaults.class]: true }}
		>
			{propsWithDefaults.children}
		</A>
	);
};

type LinkWithIconProps = LinkProps & {
	icon: string;
};

const DEFAULT_LINK_WITH_ICON_PROPS = {
	...DEFAULT_LINK_PROPS,
} as const;

export const LinkWithIcon = (props: LinkWithIconProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_LINK_WITH_ICON_PROPS, props);

	return (
		<Link href={propsWithDefaults.href} class={propsWithDefaults.class} end={propsWithDefaults.end}>
			<span class="flex items-center">
				{propsWithDefaults.children} <i class="ml-3" classList={{ [propsWithDefaults.icon]: true }} aria-hidden />
			</span>
		</Link>
	);
};
