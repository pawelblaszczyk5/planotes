import { z } from 'zod';
import { type FormErrors } from '~/shared/utils/form';

const FORM_ERRORS = {
	ICON_URL_INVALID: 'Icon URL must be a valid link',
	ID_INVALID: 'Invalid item ID, there is something off',
	NAME_REQUIRED: 'Name is required',
	NAME_TOO_SHORT: 'Name must have at least 3 characters',
	PRICE_INVALID: 'Price must be a valid integer',
	PRICE_MIN: 'Price must be bigger than 0',
} as const satisfies FormErrors;

export const addItemSchema = z.object({
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

export const editItemSchema = addItemSchema.extend({
	id: z
		.string({ invalid_type_error: FORM_ERRORS.ID_INVALID, required_error: FORM_ERRORS.ID_INVALID })
		.cuid(FORM_ERRORS.ID_INVALID),
});
