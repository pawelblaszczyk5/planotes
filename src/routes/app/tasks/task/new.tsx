import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { TaskForm } from '~/components/TaskForm';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const goals = await db.goal.findMany({
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

		return goals;
	});

const NewTask = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<TaskForm
			description="Here you can add a new task to track your progress. You can assign the task to some previously created goal (if you created one before) or just let it be standalone. Priority and size influence the prize but also positioning of tasks in list."
			title="Add a new task"
			goals={data() ?? []}
		/>
	);
};

export default NewTask;
