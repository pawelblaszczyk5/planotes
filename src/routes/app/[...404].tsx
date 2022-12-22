import { useRouteData } from 'solid-start';
import { createServerData$, HttpStatusCode } from 'solid-start/server';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);
	});

const Lost = () => {
	useRouteData<typeof routeData>()();

	return (
		<>
			<HttpStatusCode code={404} />
			<h1>Are you lost?</h1>
		</>
	);
};

export default Lost;
