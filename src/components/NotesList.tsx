import { type Note } from '@prisma/client';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { ButtonLink } from '~/components/Button';
import { Menu } from '~/components/Menu';
import { Pagination } from '~/components/Pagination';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { MODULE_ICONS } from '~/constants/moduleIcons';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import { convertFormDataIntoObject, createFormFieldsErrors } from '~/utils/form';
import { gentleScroll } from '~/utils/gentleScroll';
import { requireUserId } from '~/utils/session';

type NotesListProps = {
	currentPage: number;
	hasNextPage: boolean;
	notes: Array<Omit<Note, 'htmlContent' | 'userId'>>;
};

const FORM_ERROR = "Can't find a note with a given id";

export const NotesList = (props: NotesListProps) => {
	const [errorElement, setErrorElement] = createSignal<HTMLParagraphElement>();

	const [deleteNote, deleteNoteTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const deleteNoteSchema = z.object({
			id: z.string().cuid(),
		});

		const parsedDeleteNotePayload = deleteNoteSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedDeleteNotePayload.success) throw new FormError(FORM_ERROR);

		const note = await db.note.findUnique({
			select: { userId: true },
			where: { id: parsedDeleteNotePayload.data.id },
		});

		if (note?.userId !== userId) throw new FormError(FORM_ERROR);

		await db.note.delete({ where: { id: parsedDeleteNotePayload.data.id } });

		return redirect(request.headers.get('referer') ?? REDIRECTS.NOTES);
	});

	const deleteNoteErrors = createFormFieldsErrors(() => deleteNote.error);

	createEffect(() => {
		const error = errorElement();

		if (!error || !Object.values(deleteNoteErrors()).length) return;

		gentleScroll(error);
	});

	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your notes that you previously created. You can look browse and edit them or transform
					into tasks or goals. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/notes/note/new">Add</ButtonLink>
			</div>
			<Show when={deleteNoteErrors()['other']}>
				<p ref={setErrorElement} class="text-destructive mb-6 text-sm">
					{deleteNoteErrors()['other']}
				</p>
			</Show>
			<ul class="flex flex-col gap-6">
				<For each={props.notes}>
					{note => (
						<li class="bg-secondary grid grid-cols-[minmax(0,1fr)_7.5rem] items-center rounded py-3 px-6 shadow shadow-black/50 dark:shadow-black/90">
							<div class="mr-6 flex flex-col gap-2">
								<h3 class="truncate text-xl">{note.name}</h3>
								<p class="text-secondary truncate text-sm">{note.textContent}</p>
							</div>
							<Menu.Root triggerContent="Actions">
								<Menu.LinkItem href={`/app/notes/note/${note.id}`} id="view">
									<TextAlignedIcon icon="i-lucide-edit">View</TextAlignedIcon>
								</Menu.LinkItem>
								<deleteNoteTrigger.Form>
									<input type="hidden" value={note.id} name="id" />
									<Menu.ButtonItem id="delete">
										<TextAlignedIcon icon="i-lucide-trash-2">Delete</TextAlignedIcon>
									</Menu.ButtonItem>
								</deleteNoteTrigger.Form>
								<Menu.LinkItem href={`/app/tasks/task/new?noteId=${note.id}`} id="task">
									<TextAlignedIcon icon={MODULE_ICONS.tasks}>Task conversion</TextAlignedIcon>
								</Menu.LinkItem>
								<Menu.LinkItem href={`/app/goals/goal/new?noteId=${note.id}`} id="goal">
									<TextAlignedIcon icon={MODULE_ICONS.goals}>Goal conversion</TextAlignedIcon>
								</Menu.LinkItem>
							</Menu.Root>
						</li>
					)}
				</For>
			</ul>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<Pagination currentPage={props.currentPage} hasNextPage={props.hasNextPage} module="notes" class="my-6" />
			</Show>
		</>
	);
};
