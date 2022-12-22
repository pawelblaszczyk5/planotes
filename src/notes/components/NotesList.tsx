import { type Note } from '@prisma/client';
import { For, Show } from 'solid-js';
import { ButtonLink } from '~/shared/components/Button';
import { Pagination } from '~/shared/components/Pagination';

type NotesListProps = {
	currentPage: number;
	hasNextPage: boolean;
	notes: Array<Note>;
};

export const NotesList = (props: NotesListProps) => {
	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your notes that you previously created. You can look browse and edit them or transform
					into tasks or goals. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/notes/note/new">Add</ButtonLink>
			</div>
			<ul>
				<For each={props.notes}>
					{note => (
						<li>
							{note.name}
							<div class="prose" innerHTML={note.htmlContent} />
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
