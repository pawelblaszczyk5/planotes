import { type RouteDataFunc, redirect, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { NotesList } from '~/notes/components/NotesList';
import { ITEMS_PER_PAGE } from '~/shared/constants/pagination';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (page, { request }) => {
			const userId = await requireUserId(request);
			const numericPage = Number(page);

			if (Number.isNaN(numericPage) || numericPage < 1) throw redirect(REDIRECTS.NOTES);

			const notes = await db.note.findMany({
				orderBy: {
					createdAt: 'desc',
				},
				skip: (numericPage - 1) * ITEMS_PER_PAGE,
				take: ITEMS_PER_PAGE + 1,
				where: {
					userId,
				},
			});

			const notesPage = notes.slice(0, ITEMS_PER_PAGE);

			if (numericPage > 1 && !notesPage.length) throw redirect(REDIRECTS.NOTES);

			return { hasNextPage: notes.length === ITEMS_PER_PAGE + 1, notes: notesPage, page: numericPage };
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
