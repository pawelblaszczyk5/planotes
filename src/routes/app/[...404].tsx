import { Title, useRouteData } from 'solid-start';
import { createServerData$, HttpStatusCode } from 'solid-start/server';
import { LinkWithIcon } from '~/components/Link';
import { MODULE_ICONS } from '~/constants/moduleIcons';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		await requireUserId(request);
	});

const Lost = () => {
	useRouteData<typeof routeData>()();

	return (
		<>
			<Title>Are you lost? 😔 | Planotes</Title>
			<HttpStatusCode code={404} />
			<div class="flex max-w-3xl flex-col gap-6">
				<h2 class="text-xl">Are you lost? 😔</h2>
				<p class="text-secondary text-sm">
					It looks like the link you entered is invalid. Make sure you're navigating properly and not doing some monkey
					buisness with the URL. If you think it's not an error feel free to contact me, very appreciated!
				</p>
				<LinkWithIcon icon={MODULE_ICONS.home} class="mr-auto" href="/app/home">
					Go back to home
				</LinkWithIcon>
			</div>
		</>
	);
};

export default Lost;
