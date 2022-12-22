import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ItemList } from '~/components/ItemList';
import { getPaginatedItems } from '~/utils/pagination';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (page, { request }) => {
			const userId = await requireUserId(request);

			return getPaginatedItems(page, userId);
		},
		{
			key: () => params['page'],
		},
	)) satisfies RouteDataFunc;

const ItemListPage = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<ItemList items={data()?.items ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={data()?.page ?? 1} />
	);
};

export default ItemListPage;
