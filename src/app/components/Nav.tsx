import clsx from 'clsx';
import { A } from 'solid-start';

export const SideNavLink = (props: { external?: boolean; href: string; icon: string; title: string }) => {
	const linkTarget = () => (props.external ? '_blank' : '_self');
	const linkRel = () => (props.external ? 'noopener noreferrer' : '');

	return (
		<A
			class="ring-primary text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors flex h-10 w-10 items-center justify-center rounded-sm p-2"
			href={props.href}
			title={props.title}
			target={linkTarget()}
			rel={linkRel()}
		>
			<i class={clsx('text-3xl', props.icon)} />
		</A>
	);
};

export const SideNavButton = (props: { icon: string; onClick?: () => void; title: string }) => (
	<button
		onClick={() => props.onClick?.()}
		class="ring-primary text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors flex h-10 w-10 items-center justify-center rounded-sm p-2"
		aria-label={props.title}
	>
		<i class={clsx('text-3xl', props.icon)} />
	</button>
);

export const SideNavImageLink = (props: { href: string; src: string; title: string }) => (
	<A class="ring-primary flex h-12 w-12 items-center justify-center rounded-sm p-1" href={props.href}>
		<img class="h-full w-full" src={props.src} alt={props.title} />
	</A>
);
