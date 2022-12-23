import { type JSXElement, For, Show } from 'solid-js';
import { ButtonLink } from '~/components/Button';
import { Pagination } from '~/components/Pagination';
import { TaskStatusMenu } from '~/components/TaskStatusMenu';
import { type getPaginatedTasks } from '~/utils/pagination';

type TasksListProps = {
	currentPage: number;
	hasNextPage: boolean;
	tasks: Awaited<ReturnType<typeof getPaginatedTasks>>['tasks'];
};

type TasksListWithoutPaginationProps = {
	fallback: JSXElement;
	goalList?: boolean;
	tasks: TasksListProps['tasks'];
};

export const TasksListWithoutPagination = (props: TasksListWithoutPaginationProps) => (
	<ul class="flex flex-col gap-6">
		<For
			each={props.tasks}
			fallback={<h2 class="text-secondary col-span-full text-center text-sm">{props.fallback}</h2>}
		>
			{task => (
				<li class="bg-secondary grid grid-cols-[minmax(0,1fr)_10.5rem] items-center rounded py-3 px-6 shadow shadow-black/50 dark:shadow-black/90">
					<div class="mr-6 flex flex-col gap-2">
						<h3 class="truncate text-xl">{task.title}</h3>
						<p class="text-secondary truncate text-sm">{task.textContent}</p>
						<p>{task.size}</p>
						<p>{task.priority}</p>
					</div>
					<TaskStatusMenu
						goalList={props.goalList ?? false}
						class="flex justify-end"
						id={task.id}
						currentStatus={task.status}
					/>
				</li>
			)}
		</For>
	</ul>
);

export const TasksList = (props: TasksListProps) => {
	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your tasks that you previously created. You can look browse and edit them or transition
					their status. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/tasks/task/new">Add</ButtonLink>
			</div>
			<TasksListWithoutPagination
				fallback="You don't have any tasks yet. Go add your first one and track your work towards the success!"
				tasks={props.tasks}
			/>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<Pagination currentPage={props.currentPage} hasNextPage={props.hasNextPage} module="tasks" class="my-6" />
			</Show>
		</>
	);
};
