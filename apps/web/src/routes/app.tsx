import { Outlet } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/lib/main/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);
	});

const App = () => {
	return (
		<>
			<h1>App layout</h1>
			<Outlet />
		</>
	);
};

export default App;
