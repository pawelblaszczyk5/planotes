import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ItemsList } from '~/components/ItemsList';
import { getPaginatedItems } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		return getPaginatedItems(1, userId);
	});

const ItemsListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<ItemsList items={data()?.items ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default ItemsListPage;
