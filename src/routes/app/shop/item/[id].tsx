import { Show } from 'solid-js';
import { Title, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/components/EntityNotFound';
import { ItemForm } from '~/components/ItemForm';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

export const routeData = (({ params }) =>
	createServerData$(
		async (id, { request }) => {
			const userId = await requireUserId(request);

			const itemToEdit = await db.item.findFirst({
				where: {
					id,
					status: {
						in: ['AVAILABLE'],
					},
				},
			});

			if (itemToEdit?.userId !== userId) return;

			return itemToEdit;
		},
		{
			key: () => params['id'],
		},
	)) satisfies RouteDataFunc;

const EditItem = () => {
	const item = useRouteData<typeof routeData>();

	return (
		<Show when={item()} fallback={<EntityNotFound module="shop" />}>
			<Title>{item()!.name} | Planotes</Title>
			<ItemForm
				title="Edit item"
				item={item()!}
				description="Here you can edit previously created item. Edition won't impact existing purchases prices. However, it will impact the history of purchases."
			/>
		</Show>
	);
};

export default EditItem;
