// @refresh reload
import { Show, Suspense } from 'solid-js';
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ColorSchemeDetector } from '~/lib/main/components/ColorSchemeDetector';
import { getColorScheme } from '~/lib/main/utils/colorScheme';

import '@unocss/reset/tailwind.css';
import 'uno.css';

const Root = () => {
	const colorScheme = createServerData$(async (_, { request }) => getColorScheme(request));

	return (
		// Using classList here to workaround hydration removing 'dark' class
		<Html lang="en" classList={{ 'h-full': true }}>
			<Head>
				<Title>Planotes</Title>
				<Meta charset="utf-8" />
				<Meta name="viewport" content="width=device-width, initial-scale=1" />
				<Suspense>
					<Show when={colorScheme()}>
						<ColorSchemeDetector colorScheme={colorScheme()!} />
					</Show>
				</Suspense>
			</Head>
			<Body class="text-primary bg-primary h-full p-4">
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
	);
};

export default Root;
