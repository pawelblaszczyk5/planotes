import { type Accessor, createMemo } from 'solid-js';
import { FormError } from 'solid-start';

export const COMMON_FORM_ERRORS = {
	INTERNAL_SERVER_ERROR: 'Internal server error, try again',
	INVALID_FORM_DATA: "Make sure you're properly submitting form and try again",
} as const;

type FormErrorWithFieldErrors = typeof FormError & { fieldErrors: Record<string, string> };

export const isProperFormError = (error: unknown): error is FormErrorWithFieldErrors =>
	Boolean(error instanceof FormError && error.fieldErrors && Object.keys(error.fieldErrors).length);

export const createFormFieldsErrors = (error: Accessor<unknown>) => {
	const formFieldsErrorsMemo = createMemo(() => {
		const currentError = error();

		if (!currentError) return {};

		if (!isProperFormError(currentError)) return { other: COMMON_FORM_ERRORS.INTERNAL_SERVER_ERROR };

		return currentError.fieldErrors;
	});

	return formFieldsErrorsMemo;
};
