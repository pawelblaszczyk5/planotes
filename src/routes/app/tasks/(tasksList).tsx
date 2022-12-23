import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { TasksList } from '~/components/TasksList';
import { getPaginatedTasks } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		return getPaginatedTasks(1, userId);
	});

const TasksListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<TasksList tasks={data()?.tasks ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default TasksListPage;
