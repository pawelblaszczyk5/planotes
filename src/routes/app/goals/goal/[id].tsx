import { Show } from 'solid-js';
import { type RouteDataFunc, useRouteData, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/components/EntityNotFound';
import { GoalForm } from '~/components/GoalForm';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (id, { request }) => {
			const userId = await requireUserId(request);

			const goalToEdit = await db.goal.findUnique({
				where: {
					id,
				},
			});

			if (goalToEdit?.userId !== userId) return;

			return goalToEdit;
		},
		{
			key: params['id'],
		},
	)) satisfies RouteDataFunc;

const ViewGoal = () => {
	const goal = useRouteData<typeof routeData>();

	return (
		<Show when={goal()} fallback={<EntityNotFound module="goals" />}>
			<Title>{goal()!.title} | Planotes</Title>
			<GoalForm
				title="Edit goal"
				goal={goal()!}
				description="Here you can edit a previously created goal. You can change it status or edit info about it. You can also see a list of assigned tasks and check your progress in detail!"
			/>
		</Show>
	);
};

export default ViewGoal;
