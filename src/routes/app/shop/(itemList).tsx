import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ITEMS_PER_PAGE } from '~/shared/constants/pagination';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';
import { ItemList } from '~/shop/components/ItemList';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const items = await db.item.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			skip: 0,
			take: ITEMS_PER_PAGE + 1,
			where: {
				status: 'AVAILABLE',
				userId,
			},
		});

		const itemsPage = items.slice(0, ITEMS_PER_PAGE);

		return { hasNextPage: items.length === ITEMS_PER_PAGE + 1, items: itemsPage };
	});

const ItemListPage = () => {
	const data = useRouteData<typeof routeData>();

	return <ItemList items={data()?.items ?? []} hasNextPage={data()?.hasNextPage ?? false} currentPage={1} />;
};

export default ItemListPage;
