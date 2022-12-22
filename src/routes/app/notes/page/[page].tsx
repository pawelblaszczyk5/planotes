import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { NotesList } from '~/components/NotesList';
import { getPaginatedNotes } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (page, { request }) => {
			const userId = await requireUserId(request);

			return getPaginatedNotes(page, userId);
		},
		{
			key: () => params['page'],
		},
	)) satisfies RouteDataFunc;

const NotesListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<NotesList notes={data()?.notes ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default NotesListPage;
