import { createEffect, Show } from 'solid-js';
import { A, FormError, Outlet, useLocation, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { zfd } from 'zod-form-data';
import logo from '~/assets/logo.webp';
import { type ColorScheme, createColorSchemeCookie, getColorScheme } from '~/lib/utils/colorScheme';
import { db } from '~/lib/utils/db';
import { requireUserId } from '~/lib/utils/session';

export const routeData = () => {
	const userResource = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const user = db.user.findUniqueOrThrow({ where: { id: userId } });

		return user;
	});

	const colorSchemeResource = createServerData$(async (_, { request }) => getColorScheme(request));

	return [userResource, colorSchemeResource] as const;
};

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

const mediaQueryChangeHandler = (event: MediaQueryListEvent) => {
	if (event.matches) {
		document.documentElement.classList.add('dark');
		return;
	}

	document.documentElement.classList.remove('dark');
};

const getNextColorScheme = (currentColorScheme: ColorScheme) => {
	if (currentColorScheme === 'DARK') return 'LIGHT';
	if (currentColorScheme === 'LIGHT') return 'SYSTEM';
	return 'DARK';
};

const changeColorSchemeActionSchema = zfd.formData({
	currentLocation: zfd.text(),
});

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

	createEffect(() => {
		const currentColorScheme = colorScheme();

		if (!currentColorScheme) return;

		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

		if (currentColorScheme === 'DARK' || mediaQueryList.matches) {
			document.documentElement.classList.add('dark');
		}

		if (currentColorScheme === 'LIGHT' || !mediaQueryList.matches) {
			document.documentElement.classList.remove('dark');
		}

		if (currentColorScheme !== 'SYSTEM') return;

		mediaQueryList.addEventListener('change', mediaQueryChangeHandler);

		return () => mediaQueryList.removeEventListener('change', mediaQueryChangeHandler);
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
			<nav class="b-b md:b-r b-primary h-18 fixed top-0 left-0 flex w-full items-center px-6 py-2 md:left-0 md:top-0 md:h-full md:w-16 md:flex-col md:px-2 md:py-4">
				<NavImageLink href="/ " title="Home" src={logo} />
				<div class="ml-auto flex items-center gap-2 md:mt-auto md:flex-col md:gap-4">
					<NavButton icon="i-lucide-search" title="Search" />
					<changeColorSchemeTrigger.Form method="post">
						<input type="hidden" name="currentLocation" value={location.pathname} />
						<NavButton title={getColorSchemeChangeButtonTitle()} icon={getColorSchemeIcon()} />
					</changeColorSchemeTrigger.Form>
					<NavLink href="https://github.com/pawelblaszczyk5/planotes" title="test" icon="i-lucide-github" external />
					<div class="h-1 w-1" />
					<Show when={user()?.email}>
						{/* TODO: Change to proper seed instead of email */}
						<NavImageLink href="/app/profile" title="Go to profile" src={`/api/avatar/${user()!.email}`} />
					</Show>
				</div>
			</nav>
			<main class="top-18 fixed h-[calc(100%-4.5rem)] w-full overflow-y-auto p-6 md:right-0 md:left-16 md:top-0 md:h-full md:w-[calc(100%-4rem)]">
				<Outlet />
			</main>
		</div>
	);
};

export default App;
