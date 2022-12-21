import { Show } from 'solid-js';
import { Title, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$, HttpStatusCode } from 'solid-start/server';
import { LinkWithIcon } from '~/shared/components/Link';
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
		<Show
			when={item()}
			fallback={
				<>
					<Title>Item not found 😔 | Planotes</Title>
					<HttpStatusCode code={404} />
					<div class="flex max-w-3xl flex-col gap-6">
						<h2 class="text-xl">We can't find an item with given ID 😔</h2>
						<p class="text-secondary text-sm">Make sure you're not using a saved link to a non-existing anymore item</p>
						<LinkWithIcon icon="i-lucide-coins" class="mr-auto" href="/app/shop">
							Go back to shop
						</LinkWithIcon>
					</div>
				</>
			}
		>
			<Title>{item()!.name} | Planotes</Title>
			<ItemForm
				title="Edit existing item"
				item={item()!}
				description="Here you can edit previously created item. Edition won't impact existing purchases prices. However, it will impact the history of purchases."
			/>
		</Show>
	);
};

export default EditItem;
