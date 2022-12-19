import { Show } from 'solid-js';
import { FormError, useRouteData, type RouteDataFunc } from 'solid-start';
import { createServerData$, HttpStatusCode, createServerAction$, redirect } from 'solid-start/server';
import { LinkWithIcon } from '~/shared/components/Link';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import {
	type FormErrors,
	COMMON_FORM_ERRORS,
	convertFormDataIntoObject,
	createFormFieldsErrors,
	zodErrorToFieldErrors,
} from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';
import { ItemForm } from '~/shop/components/ItemForm';
import { editItemSchema } from '~/shop/schemas/item';

const FORM_ERRORS = {
	ITEM_UNEXISTING: "Item with a given ID doesn't exist, make sure you're editing properly",
} as const satisfies FormErrors;

export const routeData = (({ params }) => {
	const itemId = params['item'];

	return createServerData$(
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
			key: () => itemId,
		},
	);
}) satisfies RouteDataFunc;

const EditItem = () => {
	const item = useRouteData<typeof routeData>();

	const [editItem, editItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const parsedEditItemPayload = editItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedEditItemPayload.success) {
			const errors = parsedEditItemPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors<typeof editItemSchema>(errors),
			});
		}

		const currentlyEditingItem = await db.item.findUnique({
			where: {
				id: parsedEditItemPayload.data.id,
			},
		});

		if (!currentlyEditingItem || currentlyEditingItem.userId !== userId)
			throw new FormError(FORM_ERRORS.ITEM_UNEXISTING);

		await db.item.update({
			data: {
				iconUrl: parsedEditItemPayload.data.iconUrl ?? null,
				name: parsedEditItemPayload.data.name,
				price: parsedEditItemPayload.data.price,
				type: parsedEditItemPayload.data.isRecurring ? 'RECURRING' : 'ONE_TIME',
			},
			where: {
				id: parsedEditItemPayload.data.id,
			},
		});

		return redirect(REDIRECTS.SHOP);
	});

	const editItemErrors = createFormFieldsErrors<typeof editItemSchema>(() => editItem.error);

	return (
		<Show
			when={item()}
			fallback={
				<>
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
			<ItemForm
				form={editItemTrigger.Form}
				errors={editItemErrors()}
				title="Edit existing item"
				item={item()!}
				description="Here you can edit previously created item. Edition won't impact existing purchases prices. However, it will impact the history of purchases."
			/>
		</Show>
	);
};

export default EditItem;
