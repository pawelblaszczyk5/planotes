import { Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/utils/session';

export const routeData = () => {};

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
