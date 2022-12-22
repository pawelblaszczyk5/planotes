import { useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { REDIRECTS } from '~/constants/redirects';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);

		throw redirect(REDIRECTS.HOME);
	});

const Index = () => {
	useRouteData<typeof routeData>()();
};

export default Index;
