import { type Note } from '@prisma/client';
import { For, Show } from 'solid-js';
import { ButtonLink } from '~/components/Button';
import { Menu } from '~/components/Menu';
import { Pagination } from '~/components/Pagination';

type NotesListProps = {
	currentPage: number;
	hasNextPage: boolean;
	notes: Array<Omit<Note, 'htmlContent' | 'userId'>>;
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
			<ul class="flex flex-col gap-6">
				<For each={props.notes}>
					{note => (
						<li class="bg-secondary grid grid-cols-[minmax(0,1fr)_7.5rem] items-center rounded py-3 px-6 shadow shadow-black/50 dark:shadow-black/90">
							<div class="mr-6 flex flex-col gap-2">
								<h3 class="truncate text-xl">{note.name}</h3>
								<p class="text-secondary truncate text-sm">{note.textContent}</p>
							</div>
							<Menu.Root triggerContent="Actions">
								<Menu.LinkItem href={`/app/notes/note/${note.id}`} id="edit">
									<span class="inline-flex items-center gap-1">
										<i class="i-lucide-edit" />
										<span>Edit</span>
									</span>
								</Menu.LinkItem>
								<Menu.ButtonItem id="delete">
									<span class="inline-flex items-center gap-1">
										<i class="i-lucide-edit" />
										<span>Delete</span>
									</span>
								</Menu.ButtonItem>
								<Menu.LinkItem href={`/app/tasks/task/new?noteId=${note.id}`} id="task">
									<span class="inline-flex items-center gap-1">
										<i class="i-lucide-clipboard-check" />
										<span>Task conversion</span>
									</span>
								</Menu.LinkItem>
								<Menu.LinkItem href={`/app/goals/goal/new?noteId=${note.id}`} id="goal">
									<span class="inline-flex items-center gap-1">
										<i class="i-lucide-compass" />
										<span>Goal conversion</span>
									</span>
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
