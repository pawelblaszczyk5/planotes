import { type RouteDataFunc, useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { ITEMS_PER_PAGE } from '~/shared/constants/pagination';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';
import { ItemList } from '~/shop/components/ItemList';

export const routeData = (({ params }) =>
	createServerData$(
		async (page, { request }) => {
			const userId = await requireUserId(request);
			const numericPage = Number(page);

			if (Number.isNaN(numericPage) || numericPage < 1) throw redirect(REDIRECTS.SHOP);

			const items = await db.item.findMany({
				orderBy: {
					createdAt: 'desc',
				},
				skip: (numericPage - 1) * ITEMS_PER_PAGE,
				take: ITEMS_PER_PAGE + 1,
				where: {
					status: 'AVAILABLE',
					userId,
				},
			});

			const itemsPage = items.slice(0, ITEMS_PER_PAGE);

			if (numericPage > 1 && !itemsPage.length) throw redirect(REDIRECTS.SHOP);

			return { hasNextPage: items.length === ITEMS_PER_PAGE + 1, items: itemsPage, page: numericPage };
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
