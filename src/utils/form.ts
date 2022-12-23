import { type Accessor, createMemo } from 'solid-js';
import { FormError, ServerError } from 'solid-start';
import { type ZodError } from 'zod';

export type FormErrors = Record<string, string>;

export const COMMON_FORM_ERRORS = {
	BAD_REQUEST: 'Incorrect request data',
	ENTITY_UNEXISTING: "Entity with a given ID doesn't exist. Are you doing something weird?",
	FORM_DATA_INVALID: "Make sure you're properly submitting form and try again",
	ID_INVALID: 'Invalid item ID, there is something off',
	INTERNAL_SERVER_ERROR: 'Internal server error, try again',
} as const satisfies FormErrors;

export const isFormError = (error: unknown): error is FormError => Boolean(error instanceof FormError);

export const isServerError = (error: unknown): error is ServerError => error instanceof ServerError;

type FormFieldErrors = Partial<Record<string | 'other', string>>;

export const createFormFieldsErrors = (error: Accessor<unknown>) => {
	const formFieldsErrorsMemo = createMemo(currentValue => {
		const currentError = error();

		if (!currentError) return currentValue;
		if (!isFormError(currentError)) {
			if (isServerError(currentError)) return { other: currentError.message };

			return { other: COMMON_FORM_ERRORS.INTERNAL_SERVER_ERROR };
		}

		if (!currentError.fieldErrors || !Object.entries(currentError.fieldErrors).length)
			return { other: currentError.message };

		return currentError.fieldErrors;
	}, {});

	return formFieldsErrorsMemo as Accessor<FormFieldErrors>;
};

export const zodErrorToFieldErrors = (errors: ZodError['formErrors']): FormFieldErrors => ({
	...(errors.formErrors.length ? { other: COMMON_FORM_ERRORS.FORM_DATA_INVALID } : {}),
	...Object.fromEntries(
		Object.entries(errors.fieldErrors)
			.filter(([, fieldErrors]) => typeof fieldErrors !== 'undefined')
			.map(([key, fieldErrors]) => [key, fieldErrors![0]]),
	),
});

export const convertFormDataIntoObject = (formData: FormData) =>
	Array.from(formData.entries()).reduce<Record<string, unknown>>((result, [key, value]) => {
		if (value === '') return result;

		const currentKeyValue = result[key];

		if (!currentKeyValue) {
			result[key] = value;
			return result;
		}

		if (Array.isArray(currentKeyValue)) {
			currentKeyValue.push(value);
			return result;
		}

		result[key] = [currentKeyValue, value];
		return result;
	}, {});

export const isFormRequestClientSide = (request: Request) => request.headers.get('x-solidstart-origin') === 'client';
