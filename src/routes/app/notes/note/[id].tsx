import { Show } from 'solid-js';
import { Title, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { NoteForm } from '~/notes/components/NoteForm';
import { EntityNotFound } from '~/shared/components/EntityNotFound';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (id, { request }) => {
			const userId = await requireUserId(request);

			const noteToEdit = await db.note.findUnique({
				where: {
					id,
				},
			});

			if (noteToEdit?.userId !== userId) return;

			return noteToEdit;
		},
		{
			key: () => params['id'],
		},
	)) satisfies RouteDataFunc;

const EditNote = () => {
	const note = useRouteData<typeof routeData>();

	return (
		<Show when={note()} fallback={<EntityNotFound module="notes" />}>
			<Title>{note()!.name} | Planotes</Title>
			<NoteForm
				title="Edit existing item"
				note={note()!}
				description="Here you can edit previously created item. Edition won't impact existing purchases prices. However, it will impact the history of purchases."
			/>
		</Show>
	);
};

export default EditNote;
