import { Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/shared/utils/session';

export const routeData = () => createServerData$(async (_, { request }) => requireUserId(request));

const Home = () => {
	useRouteData<typeof routeData>()();

	return (
		<>
			<Title>Home | Planotes</Title>
			<h1>Home</h1>
		</>
	);
};

export default Home;
