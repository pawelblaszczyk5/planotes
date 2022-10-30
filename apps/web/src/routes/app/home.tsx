import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/lib/main/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);
	});

const Home = () => {
	useRouteData<typeof routeData>()();

	return <h1>Home</h1>;
};

export default Home;
