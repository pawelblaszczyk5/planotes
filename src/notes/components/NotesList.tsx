import { type Note } from '@prisma/client';
import { ButtonLink } from '~/shared/components/Button';

type NotesListProps = {
	currentPage: number;
	hasNextPage: boolean;
	items: Array<Note>;
};

export const NotesList = () => {
	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your notes that you previously created. You can look browse and edit them or transform
					into tasks or goals. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/notes/note/new">Add</ButtonLink>
			</div>
		</>
	);
};
