import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/lib/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), 13_000);
		});
		await requireUserId(request);
	});

const Home = () => {
	useRouteData<typeof routeData>()();

	return <h1>Home</h1>;
};

export default Home;
