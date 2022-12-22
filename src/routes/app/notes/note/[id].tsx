import { Show } from 'solid-js';
import { Title, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/components/EntityNotFound';
import { NoteForm } from '~/components/NoteForm';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

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
				title="Edit note"
				note={note()!}
				description="Here you can edit a previously created note. You can further polish your plans or just straight up rework some stuff!"
			/>
		</Show>
	);
};

export default EditNote;
