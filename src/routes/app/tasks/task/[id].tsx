import { Show } from 'solid-js';
import { type RouteDataFunc, useRouteData, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/components/EntityNotFound';
import { TaskForm } from '~/components/TaskForm';
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

			const taskToEdit = await db.task.findUnique({
				where: {
					id,
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
				description="Here you can edit a previously created task. You can change it status or edit info about it. You can also assign it to a fitting goal if you created one from back then!"
			/>
		</Show>
	);
};

export default ViewTask;
