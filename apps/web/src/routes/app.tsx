import { A, Outlet, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import logo from '~/assets/logo.webp';
import { requireUserId } from '~/lib/main/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);
	});

const NavLink = (props: { external?: boolean; href: string; icon: string; title: string }) => {
	const linkTarget = () => (props.external ? '_blank' : '_self');
	const linkRel = () => (props.external ? 'noopener noreferrer' : '');

	return (
		<A
			class="ring-primary text-primary md:text-secondary md:hover:text-primary flex h-10 w-10 items-center justify-center p-2 md:transition-colors"
			href={props.href}
			title={props.title}
			target={linkTarget()}
			rel={linkRel()}
		>
			<i class="text-3xl" classList={{ [props.icon]: true }} aria-hidden="true" />
		</A>
	);
};

const NavButton = (props: { icon: string; onClick?: () => void; title: string }) => (
	<button
		onClick={() => props.onClick?.()}
		class="ring-primary text-primary md:text-secondary md:hover:text-primary flex h-10 w-10 items-center justify-center p-2 md:transition-colors"
		aria-label={props.title}
	>
		<i class="text-3xl" classList={{ [props.icon]: true }} aria-hidden="true" />
	</button>
);

const NavImageLink = (props: { href: string; src: string; title: string }) => (
	<A class="ring-primary flex h-12 w-12 items-center justify-center p-1" href={props.href}>
		<img class="h-full w-full" src={props.src} alt={props.title} />
	</A>
);

const App = () => {
	useRouteData<typeof routeData>()();

	return (
		<div class="h-full w-full">
			<nav class="b-b md:b-r b-primary h-18 fixed top-0 left-0 flex w-full items-center px-6 py-2 md:left-0 md:top-0 md:h-full md:w-16 md:flex-col md:px-2 md:py-4">
				<NavImageLink href="/ " title="Home" src={logo} />
				<div class="ml-auto flex items-center gap-3 md:mt-auto md:flex-col md:gap-4">
					<NavButton icon="i-lucide-search" title="Search" />
					<NavButton title="test" icon="i-lucide-sun-moon" />
					<NavLink href="https://github.com/pawelblaszczyk5/planotes" title="test" icon="i-lucide-github" external />
					<div class="hidden h-1 md:block" />
					<NavImageLink href="/app/profile" title="Profile" src="https://picsum.photos/200" />
				</div>
			</nav>
			<main class="top-18 fixed h-[calc(100%-4.5rem)] w-full overflow-y-auto p-6 md:right-0 md:left-16 md:top-0 md:h-full md:w-[calc(100%-4rem)]">
				<Outlet />
			</main>
		</div>
	);
};

export default App;
