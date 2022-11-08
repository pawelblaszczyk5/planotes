import { For, Show } from 'solid-js';
import { A, FormError, Outlet, useLocation, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { zfd } from 'zod-form-data';
import logo from '~/assets/logo.webp';
import { type ColorScheme, createColorSchemeCookie, getColorScheme } from '~/lib/utils/colorScheme';
import { db } from '~/lib/utils/db';
import { createSignOutCookie, requireUserId } from '~/lib/utils/session';

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

const changeColorSchemeActionSchema = zfd.formData({
	currentLocation: zfd.text(),
});

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
			<i class="text-3xl" classList={{ [props.icon]: true }} aria-hidden="true" />
		</A>
	);
};

const SideNavButton = (props: { icon: string; onClick?: () => void; title: string }) => (
	<button
		onClick={() => props.onClick?.()}
		class="ring-primary text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors flex h-10 w-10 items-center justify-center rounded-sm p-2"
		aria-label={props.title}
	>
		<i class="text-3xl" classList={{ [props.icon]: true }} aria-hidden="true" />
	</button>
);

const SideNavImageLink = (props: { href: string; src: string; title: string }) => (
	<A class="ring-primary flex h-12 w-12 items-center justify-center rounded-sm p-1" href={props.href}>
		<img class="h-full w-full" src={props.src} alt={props.title} />
	</A>
);

const MainNavLink = (props: typeof ROUTES[number]) => (
	<A
		class="b-b-2 b-dotted b-current text-primary pointer:text-secondary pointer:hover:text-primary pointer:transition-colors ring-primary [[aria-current]&]:text-accent rounded-0.5 flex items-center py-1 text-lg outline-offset-4 md:text-xl"
		href={props.href}
	>
		{props.title} <i class="ml-3" classList={{ [props.icon]: true }} aria-hidden />
	</A>
);

export const routeData = () => {
	const userResource = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const user = db.user.findUniqueOrThrow({ where: { id: userId } });

		return user;
	});

	const colorSchemeResource = createServerData$(async (_, { request }) => getColorScheme(request));

	return [userResource, colorSchemeResource] as const;
};

const App = () => {
	const [user, colorScheme] = useRouteData<typeof routeData>();
	const location = useLocation();

	const [, changeColorSchemeTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const parsedFormData = changeColorSchemeActionSchema.safeParse(formData);

		if (!parsedFormData.success) return new FormError('Error');

		const currentColorScheme = await getColorScheme(request);
		const nextColorScheme = getNextColorScheme(currentColorScheme);
		const cookie = await createColorSchemeCookie(nextColorScheme);

		// TODO: this url must be validated
		return redirect(parsedFormData.data.currentLocation, { headers: { 'Set-Cookie': cookie } });
	});

	const [, signOutTrigger] = createServerAction$<FormData>(async (_, { request }) => {
		await requireUserId(request);

		const cookie = await createSignOutCookie(request);

		throw redirect('/', { headers: { 'Set-Cookie': cookie } });
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
						<input type="hidden" name="currentLocation" value={location.pathname} />
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
						<For each={ROUTES}>{route => <MainNavLink {...route} />}</For>
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
