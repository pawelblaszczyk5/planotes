import { Show } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/shared/components/Button';
import { Checkbox } from '~/shared/components/Checkbox';
import { Input } from '~/shared/components/Input';
import { NumberInput } from '~/shared/components/NumberInput';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import {
	COMMON_FORM_ERRORS,
	convertFormDataIntoObject,
	createFormFieldsErrors,
	zodErrorToFieldErrors,
	type FormErrors,
} from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';

const FORM_ERRORS = {
	ICON_URL_INVALID: 'Icon URL must be a valid link',
	NAME_REQUIRED: 'Name is required',
	NAME_TOO_SHORT: 'Name must have at least 3 characters',
	PRICE_INVALID: 'Price must be a valid integer',
	PRICE_MIN: 'Price must be bigger than 0',
} as const satisfies FormErrors;

const addItemSchema = z.object({
	iconUrl: z.string().url(FORM_ERRORS.ICON_URL_INVALID).optional(),
	isRecurring: z.coerce.boolean(),
	name: z
		.string({ invalid_type_error: FORM_ERRORS.NAME_REQUIRED, required_error: FORM_ERRORS.NAME_REQUIRED })
		.trim()
		.min(3, FORM_ERRORS.NAME_TOO_SHORT),
	price: z.coerce
		.number({ invalid_type_error: FORM_ERRORS.PRICE_INVALID, required_error: FORM_ERRORS.PRICE_INVALID })
		.min(1, FORM_ERRORS.PRICE_MIN),
});

const AddItem = () => {
	const [addItem, addItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);
		const parsedAddItemPayload = addItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedAddItemPayload.success) {
			const errors = parsedAddItemPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
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

	const addItemErrors = createFormFieldsErrors(() => addItem.error);

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">Add new item to shop</h2>
			<p class="text-secondary text-sm">
				Here you can add a new item that will be available in the shop for your precious points. Remember that prize
				can't be too easy. However, it also needs to be worth the hassle!
			</p>
			<addItemTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input error={addItemErrors()['name']} type="text" name="name">
					Name
				</Input>
				<Input error={addItemErrors()['iconUrl']} type="text" name="iconUrl">
					Icon URL (optional)
				</Input>
				<NumberInput error={addItemErrors()['price']} name="price">
					Price
				</NumberInput>
				<Checkbox name="isRecurring">Recurring item</Checkbox>
				<Show when={addItemErrors()['other']}>
					<p class="text-destructive text-sm">{addItemErrors()['other']}</p>
				</Show>{' '}
				<Button class="max-w-48 w-full">Add item</Button>
			</addItemTrigger.Form>
		</div>
	);
};

export default AddItem;
