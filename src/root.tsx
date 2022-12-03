// @refresh reload
import clsx from 'clsx';
import { createEffect, Show, Suspense } from 'solid-js';
import { Body, ErrorBoundary, FileRoutes, Head, Html, Link, Meta, Routes, Scripts } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { type ColorScheme, getColorScheme } from '~/utils/colorScheme';

import '@unocss/reset/tailwind.css';
import 'uno.css';

const getColorSchemeStyle = (colorScheme: ColorScheme) => {
	if (colorScheme === 'SYSTEM') return 'light dark';
	if (colorScheme === 'DARK') return 'dark';
	return 'light';
};

const mediaQueryChangeHandler = (event: MediaQueryListEvent) => {
	if (event.matches) {
		document.documentElement.classList.add('dark');
		return;
	}

	document.documentElement.classList.remove('dark');
};

const SystemPreferenceDetector = (props: { colorScheme: ColorScheme }) => {
	createEffect(() => {
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

		if (props.colorScheme === 'DARK' || mediaQueryList.matches) document.documentElement.classList.add('dark');

		if (props.colorScheme === 'LIGHT' || !mediaQueryList.matches) document.documentElement.classList.remove('dark');

		if (props.colorScheme !== 'SYSTEM') return;

		mediaQueryList.addEventListener('change', mediaQueryChangeHandler);

		return () => mediaQueryList.removeEventListener('change', mediaQueryChangeHandler);
	});

	return (
		<Show when={props.colorScheme === 'SYSTEM'}>
			<script>
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
			</script>
		</Show>
	);
};

const Root = () => {
	const colorScheme = createServerData$(async (_, { request }) => getColorScheme(request));

	return (
		<Suspense>
			{/* TODO: Remove this Show after https://github.com/solidjs/solid-start/issues/460 */}
			<Show when={colorScheme()}>
				<Html
					style={{ 'color-scheme': getColorSchemeStyle(colorScheme() ?? 'SYSTEM') }}
					lang="en"
					class={clsx('h-full', { dark: colorScheme() === 'DARK' })}
				>
					<Head>
						<Meta charset="utf-8" />
						<Meta name="viewport" content="width=device-width, initial-scale=1" />
						<Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
						<Link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
						<Link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
						<Link rel="manifest" href="/site.webmanifest" />
						<Link rel="mask-icon" href="/safari-pinned-tab.svg" color="#171717" />
						<Meta name="msapplication-TileColor" content="#171717" />
						<Meta name="theme-color" content="#171717" />
						<SystemPreferenceDetector colorScheme={colorScheme()!} />
					</Head>
					<Body class="text-primary bg-primary h-full">
						<Suspense>
							<ErrorBoundary>
								<Routes>
									<FileRoutes />
								</Routes>
							</ErrorBoundary>
						</Suspense>
						<Scripts />
					</Body>
				</Html>
			</Show>
		</Suspense>
	);
};

export default Root;
