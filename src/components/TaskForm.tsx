import { type Task, type Goal, Size, Priority } from '@prisma/client';
import { Show, type Accessor } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { type ComboboxOption, Combobox } from '~/components/Combobox';
import { Input } from '~/components/Input';
import { RadioGroup } from '~/components/Radio';
import TextEditor from '~/components/TextEditor';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import {
	type FormErrors,
	createFormFieldsErrors,
	convertFormDataIntoObject,
	COMMON_FORM_ERRORS,
	zodErrorToFieldErrors,
} from '~/utils/form';
import { transformHtml } from '~/utils/html';
import { requireUserId } from '~/utils/session';
import { getCurrentEpochSeconds } from '~/utils/time';

type TaskFormProps = {
	description: string;
	goals: Array<Pick<Goal, 'id' | 'title'>>;
	task?: Omit<Task, 'textContent'>;
	title: string;
};

const TASK_CONTENT_MAX_LENGTH = 1_000;

const FORM_ERRORS = {
	CONTENT_REQUIRED: 'Content is required',
	CONTENT_TOO_LONG: `Content mustn't be longer than ${TASK_CONTENT_MAX_LENGTH} characters`,
	GOAL_ID_INVALID: 'Make sure to properly select goal from the list',
	PRIORITY_INVALID: 'Make sure to properly select priority from the list',
	PRIORITY_REQUIRED: 'Priority is required',
	SIZE_INVALID: 'Make sure to properly select size from the list',
	SIZE_REQUIRED: 'Size is required',
	TITLE_REQUIRED: 'Name is required',
	TITLE_TOO_SHORT: 'Name must have at least 3 characters',
} satisfies FormErrors;

export const TaskForm = (props: TaskFormProps) => {
	const [upsertTask, upsertTaskTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const upsertTaskSchema = z.object({
			content: z
				.string({ invalid_type_error: FORM_ERRORS.CONTENT_REQUIRED, required_error: FORM_ERRORS.CONTENT_REQUIRED })
				.transform(val => transformHtml(val))
				.superRefine(({ charactersCount }, ctx) => {
					if (charactersCount === 0)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_REQUIRED,
						});

					if (charactersCount > TASK_CONTENT_MAX_LENGTH)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_TOO_LONG,
						});
				}),
			goalId: z
				.string({ invalid_type_error: FORM_ERRORS.GOAL_ID_INVALID })
				.cuid(FORM_ERRORS.GOAL_ID_INVALID)
				.optional(),
			id: z
				.string({ invalid_type_error: COMMON_FORM_ERRORS.ID_INVALID, required_error: COMMON_FORM_ERRORS.ID_INVALID })
				.cuid(COMMON_FORM_ERRORS.ID_INVALID)
				.optional(),
			priority: z.enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH], {
				invalid_type_error: FORM_ERRORS.PRIORITY_INVALID,
				required_error: FORM_ERRORS.PRIORITY_REQUIRED,
			}),
			size: z.enum([Size.XS, Size.S, Size.M, Size.L, Size.XL], {
				invalid_type_error: FORM_ERRORS.SIZE_INVALID,
				required_error: FORM_ERRORS.SIZE_REQUIRED,
			}),
			title: z
				.string({ invalid_type_error: FORM_ERRORS.TITLE_REQUIRED, required_error: FORM_ERRORS.TITLE_REQUIRED })
				.trim()
				.min(3, FORM_ERRORS.TITLE_TOO_SHORT),
		});

		const parsedUpsertTaskPayload = upsertTaskSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedUpsertTaskPayload.success) {
			const errors = parsedUpsertTaskPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		if (!parsedUpsertTaskPayload.data.id) {
			await db.task.create({
				data: {
					createdAt: getCurrentEpochSeconds(),
					goalId: parsedUpsertTaskPayload.data.goalId ?? null,
					htmlContent: parsedUpsertTaskPayload.data.content.htmlContent,
					priority: parsedUpsertTaskPayload.data.priority,
					size: parsedUpsertTaskPayload.data.size,
					textContent: parsedUpsertTaskPayload.data.content.textContent,
					title: parsedUpsertTaskPayload.data.title,
					userId,
				},
			});

			return redirect(REDIRECTS.TASKS);
		}

		const currentlyEditingTask = await db.task.findUnique({
			select: {
				userId: true,
			},
			where: {
				id: parsedUpsertTaskPayload.data.id,
			},
		});

		if (!currentlyEditingTask || currentlyEditingTask.userId !== userId)
			throw new FormError(COMMON_FORM_ERRORS.ENTITY_UNEXISTING);

		await db.task.update({
			data: {
				goalId: parsedUpsertTaskPayload.data.goalId ?? null,
				htmlContent: parsedUpsertTaskPayload.data.content.htmlContent,
				priority: parsedUpsertTaskPayload.data.priority,
				size: parsedUpsertTaskPayload.data.size,
				textContent: parsedUpsertTaskPayload.data.content.textContent,
				title: parsedUpsertTaskPayload.data.title,
			},
			where: {
				id: parsedUpsertTaskPayload.data.id,
			},
		});

		return redirect(REDIRECTS.TASKS);
	});

	const goalsComboboxOptions: Accessor<Array<ComboboxOption>> = () =>
		props.goals.map(({ id, title }) => ({
			label: title,
			value: id,
		}));

	const selectedGoal = () =>
		props.task ? goalsComboboxOptions().find(goalOption => goalOption.value === props.task?.goalId) ?? null : null;

	const upsertTaskErrors = createFormFieldsErrors(() => upsertTask.error);

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">{props.title}</h2>
			<p class="text-secondary text-sm">{props.description}</p>
			<upsertTaskTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input error={upsertTaskErrors()['title']} name="title" value={props.task?.title ?? ''}>
					Title
				</Input>
				<TextEditor
					error={upsertTaskErrors()['content']}
					name="content"
					value={props.task?.htmlContent ?? ''}
					maxLength={TASK_CONTENT_MAX_LENGTH}
					class="lg:-mr-48"
				>
					Content
				</TextEditor>
				<RadioGroup.Root value={props.task?.size ?? ''} name="size">
					<RadioGroup.Label>Size</RadioGroup.Label>
					<div class="flex flex-wrap gap-3">
						<RadioGroup.Item value="XS">XS</RadioGroup.Item>
						<RadioGroup.Item value="S">S</RadioGroup.Item>
						<RadioGroup.Item value="M">M</RadioGroup.Item>
						<RadioGroup.Item value="L">L</RadioGroup.Item>
						<RadioGroup.Item value="XL">XL</RadioGroup.Item>
					</div>
					<Show when={upsertTaskErrors()['size']}>
						<p class="text-destructive pt-2 text-sm">{upsertTaskErrors()['size']}</p>
					</Show>
				</RadioGroup.Root>
				<RadioGroup.Root value={props.task?.size ?? ''} name="priority">
					<RadioGroup.Label>Priority</RadioGroup.Label>
					<div class="flex flex-wrap gap-3">
						<RadioGroup.Item value="LOW">Low</RadioGroup.Item>
						<RadioGroup.Item value="MEDIUM">Medium</RadioGroup.Item>
						<RadioGroup.Item value="HIGH">High</RadioGroup.Item>
					</div>
					<Show when={upsertTaskErrors()['priority']}>
						<p class="text-destructive pt-2 text-sm">{upsertTaskErrors()['priority']}</p>
					</Show>
				</RadioGroup.Root>
				<Show when={props.goals.length}>
					<Combobox
						error={upsertTaskErrors()['goalId']}
						options={goalsComboboxOptions()}
						maxOptions={20}
						value={selectedGoal()}
						name="goalId"
					>
						Related goal (optional)
					</Combobox>
				</Show>
				<Show when={props.task}>
					<input name="id" type="hidden" value={props.task!.id} />
				</Show>
				<Show when={upsertTaskErrors()['id']}>
					<p class="text-destructive text-sm">{upsertTaskErrors()['id']}</p>
				</Show>
				<Show when={upsertTaskErrors()['other']}>
					<p class="text-destructive text-sm">{upsertTaskErrors()['other']}</p>
				</Show>
				<Button class="max-w-48 w-full">{props.task ? 'Save note' : 'Add note'}</Button>
			</upsertTaskTrigger.Form>
		</div>
	);
};
