import { type Item } from '@prisma/client';
import { type JSXElement, Show } from 'solid-js';
import { FormError, redirect } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { Checkbox } from '~/components/Checkbox';
import { Input } from '~/components/Input';
import { NumberInput } from '~/components/NumberInput';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import {
	convertFormDataIntoObject,
	COMMON_FORM_ERRORS,
	zodErrorToFieldErrors,
	type FormErrors,
	createFormFieldsErrors,
} from '~/utils/form';
import { requireUserId } from '~/utils/session';
import { getCurrentEpochSeconds } from '~/utils/time';

const FORM_ERRORS = {
	ICON_URL_INVALID: 'Icon URL must be a valid link',
	NAME_REQUIRED: 'Name is required',
	NAME_TOO_SHORT: 'Name must have at least 3 characters',
	PRICE_INVALID: 'Price must be a valid integer',
	PRICE_MIN: 'Price must be bigger than 0',
} as const satisfies FormErrors;

type ItemFormProps = {
	description: JSXElement;
	item?: Item;
	title: JSXElement;
};

export const ItemForm = (props: ItemFormProps) => {
	const [upsertItem, upsertItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const upsertItemSchema = z.object({
			iconUrl: z.string().url(FORM_ERRORS.ICON_URL_INVALID).optional(),
			id: z
				.string({ invalid_type_error: COMMON_FORM_ERRORS.ID_INVALID, required_error: COMMON_FORM_ERRORS.ID_INVALID })
				.cuid(COMMON_FORM_ERRORS.ID_INVALID)
				.optional(),
			isRecurring: z.coerce.boolean(),
			name: z
				.string({ invalid_type_error: FORM_ERRORS.NAME_REQUIRED, required_error: FORM_ERRORS.NAME_REQUIRED })
				.trim()
				.min(3, FORM_ERRORS.NAME_TOO_SHORT),
			price: z.coerce
				.number({ invalid_type_error: FORM_ERRORS.PRICE_INVALID, required_error: FORM_ERRORS.PRICE_INVALID })
				.min(1, FORM_ERRORS.PRICE_MIN),
		});

		const userId = await requireUserId(request);
		const parsedUpsertItemPayload = upsertItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedUpsertItemPayload.success) {
			const errors = parsedUpsertItemPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		if (!parsedUpsertItemPayload.data.id) {
			await db.item.create({
				data: {
					createdAt: getCurrentEpochSeconds(),
					iconUrl: parsedUpsertItemPayload.data.iconUrl ?? null,
					name: parsedUpsertItemPayload.data.name,
					price: parsedUpsertItemPayload.data.price,
					type: parsedUpsertItemPayload.data.isRecurring ? 'RECURRING' : 'ONE_TIME',
					userId,
				},
			});

			return redirect(REDIRECTS.SHOP);
		}

		const currentlyEditingItem = await db.item.findUnique({
			where: {
				id: parsedUpsertItemPayload.data.id,
			},
		});

		if (!currentlyEditingItem || currentlyEditingItem.userId !== userId)
			throw new FormError(COMMON_FORM_ERRORS.ENTITY_UNEXISTING);

		await db.item.update({
			data: {
				iconUrl: parsedUpsertItemPayload.data.iconUrl ?? null,
				name: parsedUpsertItemPayload.data.name,
				price: parsedUpsertItemPayload.data.price,
				type: parsedUpsertItemPayload.data.isRecurring ? 'RECURRING' : 'ONE_TIME',
			},
			where: {
				id: parsedUpsertItemPayload.data.id,
			},
		});

		return redirect(REDIRECTS.SHOP);
	});

	const upsertItemErrors = createFormFieldsErrors(() => upsertItem.error);

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">{props.title}</h2>
			<p class="text-secondary text-sm">{props.description}</p>
			<upsertItemTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input value={props.item?.name ?? ''} error={upsertItemErrors()['name']} type="text" name="name">
					Name
				</Input>
				<Input value={props.item?.iconUrl ?? ''} error={upsertItemErrors()['iconUrl']} type="text" name="iconUrl">
					Icon URL (optional)
				</Input>
				<NumberInput value={props.item?.price.toString() ?? '1'} error={upsertItemErrors()['price']} name="price">
					Price
				</NumberInput>
				<Checkbox checked={props.item?.type === 'RECURRING'} name="isRecurring">
					Recurring item
				</Checkbox>
				<Show when={props.item}>
					<input name="id" type="hidden" value={props.item!.id} />
				</Show>
				<Show when={upsertItemErrors()['id']}>
					<p class="text-destructive text-sm">{upsertItemErrors()['id']}</p>
				</Show>
				<Show when={upsertItemErrors()['other']}>
					<p class="text-destructive text-sm">{upsertItemErrors()['other']}</p>
				</Show>
				<Button class="max-w-48 w-full">{props.item ? 'Save item' : 'Add item'}</Button>
			</upsertItemTrigger.Form>
		</div>
	);
};
