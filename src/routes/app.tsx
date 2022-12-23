import { createEffect, createSignal, For, lazy, Show } from 'solid-js';
import { Outlet, refetchRouteData, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, json, redirect } from 'solid-start/server';
import logo from '~/assets/logo.webp';
import { LinkWithIcon } from '~/components/Link';
import { SideNavImageLink, SideNavButton, SideNavLink } from '~/components/Nav';
import { SearchModal } from '~/components/SearchModal';
import { COLOR_SCHEME_ICON, COLOR_SCHEME_TITLE } from '~/constants/colorScheme';
import { REDIRECTS } from '~/constants/redirects';
import { RESOURCE_KEY } from '~/constants/resourceKeys';
import { ROUTES } from '~/constants/routes';
import { getColorScheme, createColorSchemeCookie, getNextColorScheme } from '~/utils/colorScheme';
import { db } from '~/utils/db';
import { isFormRequestClientSide } from '~/utils/form';
import { getRandomGreeting } from '~/utils/greeting';
import { createSignOutCookie, requireUserId } from '~/utils/session';
import { isUserOnboarded } from '~/utils/user';

export const routeData = () => {
	const user = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const userFromDb = await db.user.findUnique({ where: { id: userId } });

		if (!userFromDb) {
			const cookie = await createSignOutCookie(request);

			throw redirect(REDIRECTS.SIGN_IN, { headers: { 'Set-Cookie': cookie } });
		}

		return userFromDb;
	});

	const colorScheme = createServerData$(async (_, { request }) => getColorScheme(request), {
		key: RESOURCE_KEY.COLOR_SCHEME,
	});

	return { colorScheme, user } as const;
};

const UserSettingsModal = lazy(async () => import('~/components/UserSettingsModal'));

const App = () => {
	const { user, colorScheme } = useRouteData<typeof routeData>();
	const [searchModalOpen, setSearchModalOpen] = createSignal(false);

	const [changeColorScheme, changeColorSchemeTrigger] = createServerAction$(async (_: FormData, { request }) => {
		const currentColorScheme = await getColorScheme(request);
		const nextColorScheme = getNextColorScheme(currentColorScheme);
		const cookie = await createColorSchemeCookie(nextColorScheme);

		if (isFormRequestClientSide(request)) return json({}, { headers: { 'Set-Cookie': cookie } });

		throw redirect(`${request.headers.get('referer')}` ?? REDIRECTS.HOME, { headers: { 'Set-Cookie': cookie } });
	});

	const [, signOutTrigger] = createServerAction$<FormData>(async (_, { request }) => {
		await requireUserId(request);

		const cookie = await createSignOutCookie(request);

		throw redirect(REDIRECTS.MAIN, { headers: { 'Set-Cookie': cookie } });
	});

	const getColorSchemeIcon = () => COLOR_SCHEME_ICON[colorScheme() ?? 'SYSTEM'];

	const getColorSchemeChangeButtonTitle = () => COLOR_SCHEME_TITLE[colorScheme() ?? 'SYSTEM'];

	createEffect(() => {
		if (!changeColorScheme.result) return;

		void refetchRouteData(RESOURCE_KEY.COLOR_SCHEME);
	});

	return (
		<>
			<div class="h-full w-full">
				<nav class="b-b md:b-r md:b-b-0 b-primary h-18 fixed top-0 left-0 flex w-full items-center px-6 py-2 md:left-0 md:top-0 md:h-full md:w-16 md:flex-col md:px-2 md:py-6">
					<button
						onClick={() => setSearchModalOpen(true)}
						type="button"
						class="ring-primary [&:focus-visible_*]:i-lucide-search flex h-12 w-12 items-center justify-center rounded-sm p-1 text-4xl"
					>
						<img src={logo} alt="Search" />
					</button>
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
						<SideNavImageLink
							href="/app/profile"
							title="Go to profile"
							src={`/api/avatar/${user()?.avatarSeed ?? user()?.email}`}
						/>
					</div>
				</nav>
				<main class="top-18 fixed h-[calc(100%-4.5rem)] w-full overflow-y-auto p-6 md:right-0 md:left-16 md:top-0 md:h-full md:w-[calc(100%-4rem)] md:px-9">
					<div class="items-start md:flex">
						<span class="font-500 text-3xl md:mr-6 md:w-64">{getRandomGreeting(user()?.name)}!</span>
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
					<div class="mt-10">
						<Outlet />
					</div>
				</main>
			</div>
			<Show when={user() && !isUserOnboarded(user()!)}>
				<UserSettingsModal user={user()!} />
			</Show>
			<Show when={searchModalOpen()}>
				<SearchModal onClose={() => setSearchModalOpen(false)} />
			</Show>
		</>
	);
};

export default App;
