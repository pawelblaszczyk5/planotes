import { Show } from 'solid-js';
import { Title, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { EntityNotFound } from '~/shared/components/EntityNotFound';
import { db } from '~/shared/utils/db';
import { requireUserId } from '~/shared/utils/session';
import { ItemForm } from '~/shop/components/ItemForm';

export const routeData = (({ params }) =>
	createServerData$(
		async (id, { request }) => {
			const userId = await requireUserId(request);

			const itemToEdit = await db.item.findUnique({
				where: {
					id,
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
