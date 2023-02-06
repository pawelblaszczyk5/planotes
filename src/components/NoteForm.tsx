import { type Note } from '@prisma/client';
import { Show, type JSXElement } from 'solid-js';
import { FormError, unstable_clientOnly } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { CONTENT_MAX_LENGTH } from '~/constants/contentMaxLength';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import {
	type FormErrors,
	COMMON_FORM_ERRORS,
	createFormFieldsErrors,
	convertFormDataIntoObject,
	zodErrorToFieldErrors,
} from '~/utils/form';
import { transformHtml } from '~/utils/html';
import { requireUserId } from '~/utils/session';
import { getCurrentEpochSeconds } from '~/utils/time';

const FORM_ERRORS = {
	CONTENT_REQUIRED: 'Content is required',
	CONTENT_TOO_LONG: `Content mustn't be longer than ${CONTENT_MAX_LENGTH} characters`,
	NAME_REQUIRED: 'Name is required',
	NAME_TOO_SHORT: 'Name must have at least 3 characters',
} as const satisfies FormErrors;

type NoteFormProps = {
	description: JSXElement;
	note?: Note;
	title: JSXElement;
};

const TextEditor = unstable_clientOnly(async () => import('~/components/TextEditor'));

export const NoteForm = (props: NoteFormProps) => {
	const [upsertNote, upsertNoteTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const upsertNoteSchema = z.object({
			content: z
				.string({ invalid_type_error: FORM_ERRORS.CONTENT_REQUIRED, required_error: FORM_ERRORS.CONTENT_REQUIRED })
				.transform(val => transformHtml(val))
				.superRefine(({ charactersCount }, ctx) => {
					if (charactersCount === 0)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_REQUIRED,
						});

					if (charactersCount > CONTENT_MAX_LENGTH)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_TOO_LONG,
						});
				}),
			id: z
				.string({ invalid_type_error: COMMON_FORM_ERRORS.ID_INVALID, required_error: COMMON_FORM_ERRORS.ID_INVALID })
				.cuid(COMMON_FORM_ERRORS.ID_INVALID)
				.optional(),
			name: z
				.string({ invalid_type_error: FORM_ERRORS.NAME_REQUIRED, required_error: FORM_ERRORS.NAME_REQUIRED })
				.trim()
				.min(3, FORM_ERRORS.NAME_TOO_SHORT),
		});

		const userId = await requireUserId(request);
		const parsedUpsertNotePayload = upsertNoteSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedUpsertNotePayload.success) {
			const errors = parsedUpsertNotePayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		if (!parsedUpsertNotePayload.data.id) {
			await db.note.create({
				data: {
					createdAt: getCurrentEpochSeconds(),
					htmlContent: parsedUpsertNotePayload.data.content.htmlContent,
					name: parsedUpsertNotePayload.data.name,
					textContent: parsedUpsertNotePayload.data.content.textContent,
					userId,
				},
			});

			return redirect(REDIRECTS.NOTES);
		}

		const currentlyEditingNote = await db.note.findUnique({
			select: {
				userId: true,
			},
			where: {
				id: parsedUpsertNotePayload.data.id,
			},
		});

		if (!currentlyEditingNote || currentlyEditingNote.userId !== userId)
			throw new FormError(COMMON_FORM_ERRORS.ENTITY_UNEXISTING);

		await db.note.update({
			data: {
				htmlContent: parsedUpsertNotePayload.data.content.htmlContent,
				name: parsedUpsertNotePayload.data.name,
				textContent: parsedUpsertNotePayload.data.content.textContent,
			},
			where: {
				id: parsedUpsertNotePayload.data.id,
			},
		});

		return redirect(REDIRECTS.NOTES);
	});

	const upsertNoteErrors = createFormFieldsErrors(() => upsertNote.error);

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">{props.title}</h2>
			<p class="text-secondary text-sm">{props.description}</p>
			<upsertNoteTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input error={upsertNoteErrors()['name']} name="name" value={props.note?.name ?? ''}>
					Name
				</Input>
				<TextEditor
					error={upsertNoteErrors()['content']}
					name="content"
					value={props.note?.htmlContent ?? ''}
					maxLength={CONTENT_MAX_LENGTH}
					class="lg:-mr-48"
				>
					Content
				</TextEditor>
				<Show when={props.note}>
					<input name="id" type="hidden" value={props.note!.id} />
				</Show>
				<Show when={upsertNoteErrors()['id']}>
					<p class="text-destructive text-sm">{upsertNoteErrors()['id']}</p>
				</Show>
				<Show when={upsertNoteErrors()['other']}>
					<p class="text-destructive text-sm">{upsertNoteErrors()['other']}</p>
				</Show>
				<Button class="max-w-48 w-full">{props.note ? 'Save note' : 'Add note'}</Button>
			</upsertNoteTrigger.Form>
		</div>
	);
};
