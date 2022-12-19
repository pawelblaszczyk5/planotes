import { FormError, Title } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import {
	COMMON_FORM_ERRORS,
	convertFormDataIntoObject,
	createFormFieldsErrors,
	zodErrorToFieldErrors,
} from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';
import { ItemForm } from '~/shop/components/ItemForm';
import { addItemSchema } from '~/shop/schemas/item';

const AddItem = () => {
	const [addItem, addItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);
		const parsedAddItemPayload = addItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedAddItemPayload.success) {
			const errors = parsedAddItemPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors<typeof addItemSchema>(errors),
			});
		}

		await db.item.create({
			data: {
				iconUrl: parsedAddItemPayload.data.iconUrl ?? null,
				name: parsedAddItemPayload.data.name,
				price: parsedAddItemPayload.data.price,
				type: parsedAddItemPayload.data.isRecurring ? 'RECURRING' : 'ONE_TIME',
				userId,
			},
		});

		return redirect(REDIRECTS.SHOP);
	});

	const addItemErrors = createFormFieldsErrors<typeof addItemSchema>(() => addItem.error);

	return (
		<>
			<Title>Add item | Planotes</Title>
			<ItemForm
				form={addItemTrigger.Form}
				errors={addItemErrors()}
				description="Here you can add a new item that will be available in the shop for your precious points. Remember that prize can't be too easy. However, it also needs to be worth the hassle!"
				title="Add new item to shop"
			/>
		</>
	);
};

export default AddItem;
