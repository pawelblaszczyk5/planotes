import { useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { requireUserId } from '~/lib/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);

		throw redirect('/app/home');
	});

const Index = () => {
	useRouteData<typeof routeData>()();
};

export default Index;
