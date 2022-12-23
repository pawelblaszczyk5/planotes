import { For, Show } from 'solid-js';
import { ButtonLink } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { TaskStatusMenu } from '~/components/TaskStatusMenu';
import { type getPaginatedTasks } from '~/utils/pagination';

type TasksListProps = {
	currentPage: number;
	hasNextPage: boolean;
	tasks: Awaited<ReturnType<typeof getPaginatedTasks>>['tasks'];
};

export const TasksList = (props: TasksListProps) => {
	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your tasks that you previously created. You can look browse and edit them or transition
					their status. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/tasks/goal/new">Add</ButtonLink>
			</div>
			<ul class="flex flex-col gap-6">
				<For
					each={props.tasks}
					fallback={
						<h2 class="text-secondary col-span-full text-center text-sm">
							You don't have any tasks yet. Go add your first one and track your work towards the success!
						</h2>
					}
				>
					{goal => (
						<li class="bg-secondary grid grid-cols-[minmax(0,1fr)_10.5rem] items-center rounded py-3 px-6 shadow shadow-black/50 dark:shadow-black/90">
							<div class="mr-6 flex flex-col gap-2">
								<h3 class="truncate text-xl">{goal.title}</h3>
								<p class="text-secondary truncate text-sm">{goal.textContent}</p>
								<p>{goal.size}</p>
								<p>{goal.priority}</p>
							</div>
							<TaskStatusMenu class="flex justify-end" id={goal.id} currentStatus={goal.status} />
						</li>
					)}
				</For>
			</ul>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<Pagination currentPage={props.currentPage} hasNextPage={props.hasNextPage} module="tasks" class="my-6" />
			</Show>
		</>
	);
};
