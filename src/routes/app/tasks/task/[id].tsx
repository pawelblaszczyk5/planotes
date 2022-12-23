import { Show } from 'solid-js';
import { type RouteDataFunc, useRouteData, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/components/EntityNotFound';
import { TaskForm } from '~/components/TaskForm';
import { TaskStatusMenu } from '~/components/TaskStatusMenu';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) => {
	const goals = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const availableGoals = await db.goal.findMany({
			select: {
				id: true,
				title: true,
			},
			where: {
				status: {
					in: ['IN_PROGRESS', 'TO_DO'],
				},
				userId,
			},
		});

		return availableGoals;
	});

	const task = createServerData$(
		async (id, { request }) => {
			const userId = await requireUserId(request);

			const taskToEdit = await db.task.findFirst({
				where: {
					id,
					status: {
						in: ['IN_PROGRESS', 'TO_DO'],
					},
				},
			});

			if (taskToEdit?.userId !== userId) return;

			return taskToEdit;
		},
		{
			key: params['id'],
		},
	);

	return { goals, task };
}) satisfies RouteDataFunc;

const ViewTask = () => {
	const { goals, task } = useRouteData<typeof routeData>();

	return (
		<Show when={task()} fallback={<EntityNotFound module="tasks" />}>
			<Title>{task()!.title} | Planotes</Title>
			<TaskForm
				title="Edit task"
				task={task()!}
				goals={goals() ?? []}
				description={
					<div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
						<span>
							Here you can edit a previously created task. You can change it status or edit info about it. You can also
							assign it to a fitting goal if you created one from back then!
						</span>{' '}
						<TaskStatusMenu class="min-w-42" id={task()!.id} currentStatus={task()!.status} />
					</div>
				}
			/>
		</Show>
	);
};

export default ViewTask;
