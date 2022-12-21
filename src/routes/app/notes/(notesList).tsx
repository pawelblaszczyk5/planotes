import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { NotesList } from '~/notes/components/NotesList';
import { ITEMS_PER_PAGE } from '~/shared/constants/pagination';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const notes = await db.note.findMany({
			skip: 0,
			take: ITEMS_PER_PAGE + 1,
			where: {
				userId,
			},
		});

		const notesPage = notes.slice(0, ITEMS_PER_PAGE);

		return { hasNextPage: notes.length === ITEMS_PER_PAGE + 1, notes: notesPage };
	});

const NotesListPage = () => {
	const data = useRouteData<typeof routeData>();

	return <NotesList notes={data()?.notes ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={1} />;
};

export default NotesListPage;
