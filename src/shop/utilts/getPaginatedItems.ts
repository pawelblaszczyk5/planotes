import { redirect } from 'solid-start';
import { ITEMS_PER_PAGE } from '~/shared/constants/pagination';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';

export const getPaginatedItems = async (pageParam: number | string, userId: string) => {
	const page = Number(pageParam);

	if (Number.isNaN(page) || page < 1) throw redirect(REDIRECTS.NOTES);

	const items = await db.item.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		skip: (page - 1) * ITEMS_PER_PAGE,
		take: ITEMS_PER_PAGE + 1,
		where: {
			userId,
		},
	});

	const itemsPage = items.slice(0, ITEMS_PER_PAGE);

	if (page > 1 && !itemsPage.length) throw redirect(REDIRECTS.NOTES);

	return { hasNextPage: items.length === ITEMS_PER_PAGE + 1, items: itemsPage, page };
};
