import clsx from 'clsx';
import { For, Show } from 'solid-js';
import { A, FormError, Outlet, useLocation, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { zfd } from 'zod-form-data';
import logo from '~/assets/logo.webp';
import { LinkWithIcon } from '~/components/Link';
import { type ColorScheme, createColorSchemeCookie, getColorScheme } from '~/utils/colorScheme';
import { db } from '~/utils/db';
import { REDIRECTS } from '~/utils/redirects';
import { createSignOutCookie, requireUserId } from '~/utils/session';

const ROUTES = [
	{ href: '/app/home', icon: 'i-lucide-home', title: 'Home' },
	{ href: '/app/habits', icon: 'i-lucide-recycle', title: 'Habits' },
	{ href: '/app/goals', icon: 'i-lucide-compass', title: 'Goals' },
	{ href: '/app/tasks', icon: 'i-lucide-clipboard-check', title: 'Tasks' },
	{ href: '/app/notes', icon: 'i-lucide-sticky-note', title: 'Notes' },
	{ href: '/app/shop', icon: 'i-lucide-coins', title: 'Shop' },
] as const;

const getNextColorScheme = (currentColorScheme: ColorScheme) => {
	if (currentColorScheme === 'DARK') return 'LIGHT';
	if (currentColorScheme === 'LIGHT') return 'SYSTEM';
	return 'DARK';
};

const SideNavLink = (props: { external?: boolean; href: string; icon: string; title: string }) => {
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
			<i class={clsx('text-3xl', props.icon)} aria-hidden="true" />
		</A>
	);
};

const SideNavButton = (props: { icon: string; onClick?: () => void; title: string }) => (
	<button
		onClick={() => props.onClick?.()}
		class="ring-primary text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors flex h-10 w-10 items-center justify-center rounded-sm p-2"
		aria-label={props.title}
	>
		<i class={clsx('text-3xl', props.icon)} aria-hidden="true" />
	</button>
);

const SideNavImageLink = (props: { href: string; src: string; title: string }) => (
	<A class="ring-primary flex h-12 w-12 items-center justify-center rounded-sm p-1" href={props.href}>
		<img class="h-full w-full" src={props.src} alt={props.title} />
	</A>
);

export const routeData = () => {
	const userResource = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const user = await db.user.findUnique({ where: { id: userId } });

		if (!user) {
			const cookie = await createSignOutCookie(request);

			throw redirect(REDIRECTS.MAIN, { headers: { 'Set-Cookie': cookie } });
		}

		return user;
	});

	const colorSchemeResource = createServerData$(async (_, { request }) => await getColorScheme(request));

	return [userResource, colorSchemeResource] as const;
};

const App = () => {
	const [user, colorScheme] = useRouteData<typeof routeData>();
	const [, changeColorSchemeTrigger] = createServerAction$(async (_: FormData, { request }) => {
		const currentColorScheme = await getColorScheme(request);
		const nextColorScheme = getNextColorScheme(currentColorScheme);
		const cookie = await createColorSchemeCookie(nextColorScheme);

		return redirect(request.headers.get('referer') ?? REDIRECTS.HOME, { headers: { 'Set-Cookie': cookie } });
	});

	const [, signOutTrigger] = createServerAction$<FormData>(async (_, { request }) => {
		await requireUserId(request);

		const cookie = await createSignOutCookie(request);

		throw redirect(REDIRECTS.MAIN, { headers: { 'Set-Cookie': cookie } });
	});

	const getColorSchemeIcon = () => {
		const currentColorScheme = colorScheme();

		if (!currentColorScheme || currentColorScheme === 'SYSTEM') return 'i-lucide-laptop-2';
		if (currentColorScheme === 'DARK') return 'i-lucide-moon';
		return 'i-lucide-sun';
	};

	const getColorSchemeChangeButtonTitle = () => {
		const currentColorScheme = colorScheme();

		if (!currentColorScheme || currentColorScheme === 'SYSTEM') return 'Change color scheme - currently system';
		if (currentColorScheme === 'DARK') return 'Change color scheme - currently dark';
		return 'Change color scheme - currently light';
	};

	return (
		<div class="h-full w-full">
			<nav class="b-b md:b-r md:b-b-0 b-primary h-18 fixed top-0 left-0 flex w-full items-center px-6 py-2 md:left-0 md:top-0 md:h-full md:w-16 md:flex-col md:px-2 md:py-6">
				<SideNavImageLink href="/ " title="Home" src={logo} />
				<div class="ml-auto flex items-center gap-2 md:mt-auto md:flex-col md:gap-4">
					<changeColorSchemeTrigger.Form method="post">
						<SideNavButton title={getColorSchemeChangeButtonTitle()} icon={getColorSchemeIcon()} />
					</changeColorSchemeTrigger.Form>
					<signOutTrigger.Form method="post">
						<SideNavButton title="Sign out" icon="i-lucide-log-out" />
					</signOutTrigger.Form>
					<SideNavLink
						href="https://github.com/pawelblaszczyk5/planotes"
						title="test"
						icon="i-lucide-github"
						external
					/>
					<div class="h-1 w-1" />
					<Show when={user()?.email}>
						{/* TODO: Change to proper seed instead of email */}
						<SideNavImageLink href="/app/profile" title="Go to profile" src={`/api/avatar/${user()!.email}`} />
					</Show>
				</div>
			</nav>
			<main class="top-18 fixed h-[calc(100%-4.5rem)] w-full overflow-y-auto p-6 md:right-0 md:left-16 md:top-0 md:h-full md:w-[calc(100%-4rem)]">
				<div class="items-start md:flex">
					{/* TODO: Change to username and a random greeting probably or something different */}
					<h1 class="text-4xl font-bold md:mr-6">Lorem ipsum!</h1>
					<nav class="mt-6 flex flex-wrap gap-x-6 gap-y-4 md:ml-auto md:mt-0">
						<For each={ROUTES}>
							{route => (
								<LinkWithIcon icon={route.icon} href={route.href}>
									{route.title}
								</LinkWithIcon>
							)}
						</For>
					</nav>
				</div>
				<div class="mt-12">
					<Outlet />
				</div>
			</main>
		</div>
	);
};

export default App;
