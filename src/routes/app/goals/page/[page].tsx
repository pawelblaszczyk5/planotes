import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { GoalsList } from '~/components/GoalsList';
import { getPaginatedGoals } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (page, { request }) => {
			const userId = await requireUserId(request);

			return getPaginatedGoals(page, userId);
		},
		{
			key: () => params['page'],
		},
	)) satisfies RouteDataFunc;

const GoalsListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<GoalsList goals={data()?.goals ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default GoalsListPage;
