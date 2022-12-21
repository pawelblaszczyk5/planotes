import { type Note } from '@prisma/client';
import { Show, type JSXElement } from 'solid-js';
import { unstable_clientOnly } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import { Button } from '~/shared/components/Button';
import { Input } from '~/shared/components/Input';
import { createFormFieldsErrors } from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';

type NoteFormProps = {
	description: JSXElement;
	note?: Note;
	title: JSXElement;
};

const TextEditor = unstable_clientOnly(async () => import('~/shared/components/TextEditor'));

export const NoteForm = (props: NoteFormProps) => {
	const [upsertNote, upsertNoteTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);
	});

	const upsertNoteErrors = createFormFieldsErrors(() => upsertNote.error);

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">{props.title}</h2>
			<p class="text-secondary text-sm">{props.description}</p>
			<upsertNoteTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input name="name" value={props.note?.name ?? ''}>
					Name
				</Input>
				<TextEditor name="content" maxLength={250} class="lg:-mr-48">
					Content
				</TextEditor>
				<Show when={upsertNoteErrors().id}>
					<p class="text-destructive text-sm">{upsertNoteErrors().id}</p>
				</Show>
				<Show when={upsertNoteErrors().other}>
					<p class="text-destructive text-sm">{upsertNoteErrors().other}</p>
				</Show>
				<Button class="max-w-48 w-full">{props.note ? 'Save note' : 'Add note'}</Button>
			</upsertNoteTrigger.Form>
		</div>
	);
};
