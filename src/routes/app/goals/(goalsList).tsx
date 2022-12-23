import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { GoalsList } from '~/components/GoalsList';
import { getPaginatedGoals } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		return getPaginatedGoals(1, userId);
	});

const GoalsListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<GoalsList goals={data()?.goals ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default GoalsListPage;
