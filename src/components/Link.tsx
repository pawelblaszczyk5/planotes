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
			class="b-b-2 b-dotted b-current text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors ring-primary [[aria-current]&]:text-accent rounded-0.5 py-1 text-lg outline-offset-4"
			end={propsWithDefaults.end}
			href={propsWithDefaults.href}
			classList={{ [propsWithDefaults.class]: true }}
		>
			{propsWithDefaults.children}
		</A>
	);
};
