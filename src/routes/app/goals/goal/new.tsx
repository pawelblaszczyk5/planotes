import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { GoalForm } from '~/components/GoalForm';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

export const routeData = (({ location }) =>
	createServerData$(
		async (noteId, { request }) => {
			const userId = await requireUserId(request);

			const note = await db.note.findFirst({
				select: {
					htmlContent: true,
					id: true,
					name: true,
				},
				where: {
					id: noteId,
					userId,
				},
			});

			return note;
		},
		{
			key: () => location.query['noteId'],
		},
	)) satisfies RouteDataFunc;

const NewGoal = () => {
	const noteToConvert = useRouteData<typeof routeData>();

	return (
		<GoalForm
			description="Here you can add a new goal to track your progress. Goals let's you group related tasks and track progress among all of them easily! Priority and size influence the prize"
			title="Add a new goal"
			noteToConvert={noteToConvert()}
		/>
	);
};

export default NewGoal;
