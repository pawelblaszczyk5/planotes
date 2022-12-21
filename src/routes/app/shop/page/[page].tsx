import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { requireUserId } from '~/shared/utils/session';
import { ItemList } from '~/shop/components/ItemList';
import { getPaginatedItems } from '~/shop/utilts/getPaginatedItems';

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
