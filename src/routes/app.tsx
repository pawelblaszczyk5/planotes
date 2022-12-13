import { type User } from '@prisma/client';
import clsx from 'clsx';
import { For, Show } from 'solid-js';
import { A, FormError, Outlet, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { z } from 'zod';
import logo from '~/assets/logo.webp';
import { Button } from '~/components/Button';
import { type ComboboxOption, Combobox } from '~/components/Combobox';
import { RouteDialog } from '~/components/Dialog';
import { Input } from '~/components/Input';
import { LinkWithIcon } from '~/components/Link';
import { type ColorScheme, createColorSchemeCookie, getColorScheme } from '~/utils/colorScheme';
import { db } from '~/utils/db';
import {
	COMMON_FORM_ERRORS,
	convertFormDataIntoObject,
	createFormFieldsErrors,
	zodErrorToFieldErrors,
} from '~/utils/form';
import { createDebouncedSignal } from '~/utils/primitives';
import { REDIRECTS } from '~/utils/redirects';
import { createSignOutCookie, requireUserId } from '~/utils/session';
import { IANA_TIMEZONES } from '~/utils/timezones';
import { type FormErrors } from '~/utils/types';

const ROUTES = [
	{ href: '/app/home', icon: 'i-lucide-home', title: 'Home' },
	{ href: '/app/habits', icon: 'i-lucide-recycle', title: 'Habits' },
	{ href: '/app/goals', icon: 'i-lucide-compass', title: 'Goals' },
	{ href: '/app/tasks', icon: 'i-lucide-clipboard-check', title: 'Tasks' },
	{ href: '/app/notes', icon: 'i-lucide-sticky-note', title: 'Notes' },
	{ href: '/app/shop', icon: 'i-lucide-coins', title: 'Shop' },
] as const satisfies ReadonlyArray<Readonly<{ href: string; icon: string; title: string }>>;

const getNextColorScheme = (currentColorScheme: ColorScheme) => {
	if (currentColorScheme === 'DARK') return 'LIGHT';
	if (currentColorScheme === 'LIGHT') return 'SYSTEM';
	return 'DARK';
};

const isUserOnboarded = (user: User) => user.avatarSeed !== null && user.name !== null;

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

const timezonesComboboxOptions = IANA_TIMEZONES.map<ComboboxOption>(timezone => ({
	label: timezone.replaceAll('_', ' '),
	value: timezone,
}));

const FORM_ERRORS = {
	AVATAR_SEED_REQUIRED: 'Avatar seed is required',
	INCORRECT_TIMEZONE: 'Make sure you choosed a proper timezone',
	NAME_REQUIRED: 'Name is required',
} as const satisfies FormErrors;

const userSettingsFormSchema = z.object({
	avatarSeed: z
		.string({
			invalid_type_error: FORM_ERRORS.AVATAR_SEED_REQUIRED,
			required_error: FORM_ERRORS.AVATAR_SEED_REQUIRED,
		})
		.min(1, FORM_ERRORS.AVATAR_SEED_REQUIRED),
	name: z
		.string({
			invalid_type_error: FORM_ERRORS.NAME_REQUIRED,
			required_error: FORM_ERRORS.NAME_REQUIRED,
		})
		.trim()
		.min(1, FORM_ERRORS.NAME_REQUIRED),
	timezone: z.enum(IANA_TIMEZONES, {
		invalid_type_error: FORM_ERRORS.INCORRECT_TIMEZONE,
		required_error: FORM_ERRORS.INCORRECT_TIMEZONE,
	}),
});

const UserSettingsForm = (props: { user: User }) => {
	const [onboard, onboardTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const parsedFormData = userSettingsFormSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedFormData.success) {
			const errors = parsedFormData.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		await db.user.update({
			data: {
				avatarSeed: parsedFormData.data.avatarSeed,
				name: parsedFormData.data.name,
				timezone: parsedFormData.data.timezone,
			},
			where: { id: userId },
		});

		return redirect(request.headers.get('referer') ?? REDIRECTS.HOME);
	});

	const onboardErrors = createFormFieldsErrors(() => onboard.error);

	const [avatarSeed, setAvatarSeed] = createDebouncedSignal('');

	const avatarUrl = () =>
		`/api/avatar/${encodeURIComponent(avatarSeed() || props.user.avatarSeed || props.user.email)}`;

	const userTimezone = () => {
		if (import.meta.env.SSR) return null;

		return (
			timezonesComboboxOptions.find(
				timezone => timezone.value === new Intl.DateTimeFormat().resolvedOptions().timeZone,
			) ?? null
		);
	};

	const handleInputsChange = (
		event: InputEvent & {
			currentTarget: HTMLDivElement;
			target: Element;
		},
	) => {
		if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'avatarSeed') return;

		setAvatarSeed(event.target.value);
	};

	return (
		<onboardTrigger.Form class="flex flex-col gap-6">
			<div class="flex flex w-full flex-col flex-col items-center gap-6 md:flex-row-reverse">
				<img class="max-w-32 block" src={avatarUrl()} alt="New avatar preview" />
				<div class="flex w-full flex-col gap-6" onInput={handleInputsChange}>
					<Input error={onboardErrors()['name']} name="name">
						Name
					</Input>
					<Input name="avatarSeed" error={onboardErrors()['avatarSeed']}>
						Avatar seed
					</Input>
				</div>
			</div>
			<Combobox options={timezonesComboboxOptions} maxOptions={20} value={userTimezone()} name="timezone">
				Timezone
			</Combobox>
			<Show when={onboardErrors()['other']}>
				<p class="text-destructive text-sm">{onboardErrors()['other']}</p>
			</Show>
			<Button class="max-w-48 mx-auto w-full">Save profile</Button>
		</onboardTrigger.Form>
	);
};

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

	const colorSchemeResource = createServerData$(async (_, { request }) => getColorScheme(request));

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
		<>
			<div class="h-full w-full">
				<nav class="b-b md:b-r md:b-b-0 b-primary h-18 fixed top-0 left-0 flex w-full items-center px-6 py-2 md:left-0 md:top-0 md:h-full md:w-16 md:flex-col md:px-2 md:py-6">
					<SideNavImageLink href="/" title="Home" src={logo} />
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
				<main class="top-18 fixed h-[calc(100%-4.5rem)] w-full overflow-y-auto p-6 md:right-0 md:left-16 md:top-0 md:h-full md:w-[calc(100%-4rem)]">
					<div class="items-start md:flex">
						{/* TODO: I'd like it to be randomly generated each time from some predefined ones */}
						<h1 class="text-4xl font-bold md:mr-6">Hello{user()?.name ? ` ${user()?.name}` : ''}!</h1>
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
			<Show when={user() && !isUserOnboarded(user()!)}>
				<RouteDialog
					title="Finish your onboarding!"
					description="There are few additional things to make your experience with Planotes awesomely personalized 😊 You can edit these options on your profile anytime!"
				>
					<UserSettingsForm user={user()!} />
				</RouteDialog>
			</Show>
		</>
	);
};

export default App;
