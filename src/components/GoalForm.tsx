import { type Task, type Note, type Goal, Size, Priority } from '@prisma/client';
import { type JSXElement, Show, createMemo } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { RadioGroup } from '~/components/Radio';
import { TasksListWithoutPagination } from '~/components/TasksList';
import TextEditor from '~/components/TextEditor';
import { REDIRECTS } from '~/constants/redirects';
import { calculateAdjustedPercent } from '~/utils/adjustedPercent';
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

const GOAL_CONTENT_MAX_LENGTH = 1_000;

const FORM_ERRORS = {
	CONTENT_REQUIRED: 'Content is required',
	CONTENT_TOO_LONG: `Content mustn't be longer than ${GOAL_CONTENT_MAX_LENGTH} characters`,
	NOTE_NOT_FOUND: "Note with given ID to convert  can't be found",
	PRIORITY_INVALID: 'Make sure to properly select priority from the list',
	PRIORITY_REQUIRED: 'Priority is required',
	SIZE_INVALID: 'Make sure to properly select size from the list',
	SIZE_REQUIRED: 'Size is required',
	TITLE_REQUIRED: 'Name is required',
	TITLE_TOO_SHORT: 'Name must have at least 3 characters',
} satisfies FormErrors;

type GoalFormProps = {
	description: JSXElement;
	goal?: Omit<Goal & { Task?: Array<Task> }, 'textContent'>;
	noteToConvert?: Pick<Note, 'htmlContent' | 'id' | 'name'> | null | undefined;
	title: JSXElement;
};

export const GoalForm = (props: GoalFormProps) => {
	const [upsertGoal, upsertGoalTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const goalUpsertSchema = z.object({
			content: z
				.string({ invalid_type_error: FORM_ERRORS.CONTENT_REQUIRED, required_error: FORM_ERRORS.CONTENT_REQUIRED })
				.transform(val => transformHtml(val))
				.superRefine(({ charactersCount }, ctx) => {
					if (charactersCount === 0)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_REQUIRED,
						});

					if (charactersCount > GOAL_CONTENT_MAX_LENGTH)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: FORM_ERRORS.CONTENT_TOO_LONG,
						});
				}),
			id: z
				.string({ invalid_type_error: COMMON_FORM_ERRORS.ID_INVALID, required_error: COMMON_FORM_ERRORS.ID_INVALID })
				.cuid(COMMON_FORM_ERRORS.ID_INVALID)
				.optional(),
			noteId: z
				.string({
					invalid_type_error: FORM_ERRORS.NOTE_NOT_FOUND,
					required_error: FORM_ERRORS.NOTE_NOT_FOUND,
				})
				.cuid(FORM_ERRORS.NOTE_NOT_FOUND)
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

		const parsedUpsertGoalPayload = goalUpsertSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedUpsertGoalPayload.success) {
			const errors = parsedUpsertGoalPayload.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		if (!parsedUpsertGoalPayload.data.id) {
			if (parsedUpsertGoalPayload.data.noteId) {
				try {
					await db.note.delete({ where: { id: parsedUpsertGoalPayload.data.noteId } });
				} catch {
					throw new FormError(FORM_ERRORS.NOTE_NOT_FOUND);
				}
			}

			await db.goal.create({
				data: {
					createdAt: getCurrentEpochSeconds(),
					htmlContent: parsedUpsertGoalPayload.data.content.htmlContent,
					priority: parsedUpsertGoalPayload.data.priority,
					size: parsedUpsertGoalPayload.data.size,
					textContent: parsedUpsertGoalPayload.data.content.textContent,
					title: parsedUpsertGoalPayload.data.title,
					userId,
				},
			});

			return redirect(REDIRECTS.GOALS);
		}

		const currentlyEditingGoal = await db.goal.findUnique({
			select: {
				userId: true,
			},
			where: {
				id: parsedUpsertGoalPayload.data.id,
			},
		});

		if (!currentlyEditingGoal || currentlyEditingGoal.userId !== userId)
			throw new FormError(COMMON_FORM_ERRORS.ENTITY_UNEXISTING);

		await db.goal.update({
			data: {
				htmlContent: parsedUpsertGoalPayload.data.content.htmlContent,
				priority: parsedUpsertGoalPayload.data.priority,
				size: parsedUpsertGoalPayload.data.size,
				textContent: parsedUpsertGoalPayload.data.content.textContent,
				title: parsedUpsertGoalPayload.data.title,
			},
			where: {
				id: parsedUpsertGoalPayload.data.id,
			},
		});

		return redirect(REDIRECTS.GOALS);
	});

	const goalCompletionStats = createMemo(() => {
		if (!props.goal?.Task) return;

		const completedTasks = props.goal.Task.filter(task => task.status === 'COMPLETED').length;
		const allTasks = props.goal.Task.length;

		return {
			max: allTasks,
			min: 0,
			now: completedTasks,
			percent: calculateAdjustedPercent(completedTasks, allTasks),
		};
	});

	const upsertGoalErrors = createFormFieldsErrors(() => upsertGoal.error);

	return (
		<>
			<div class="flex max-w-3xl flex-col gap-6">
				<h2 class="text-xl">{props.title}</h2>
				<div class="text-secondary text-sm">{props.description}</div>
				<upsertGoalTrigger.Form class="flex max-w-xl flex-col gap-6">
					<Input
						error={upsertGoalErrors()['title']}
						name="title"
						value={props.goal?.title ?? props.noteToConvert?.name ?? ''}
					>
						Title
					</Input>
					<TextEditor
						error={upsertGoalErrors()['content']}
						name="content"
						value={props.goal?.htmlContent ?? props.noteToConvert?.htmlContent ?? ''}
						maxLength={GOAL_CONTENT_MAX_LENGTH}
						class="lg:-mr-48"
					>
						Content
					</TextEditor>
					<RadioGroup.Root value={props.goal?.size ?? ''} name="size">
						<RadioGroup.Label>Size</RadioGroup.Label>
						<div class="flex flex-wrap gap-3">
							<RadioGroup.Item value={Size.XS}>XS</RadioGroup.Item>
							<RadioGroup.Item value={Size.S}>S</RadioGroup.Item>
							<RadioGroup.Item value={Size.M}>M</RadioGroup.Item>
							<RadioGroup.Item value={Size.L}>L</RadioGroup.Item>
							<RadioGroup.Item value={Size.XL}>XL</RadioGroup.Item>
						</div>
						<Show when={upsertGoalErrors()['size']}>
							<p class="text-destructive pt-2 text-sm">{upsertGoalErrors()['size']}</p>
						</Show>
					</RadioGroup.Root>
					<RadioGroup.Root value={props.goal?.priority ?? ''} name="priority">
						<RadioGroup.Label>Priority</RadioGroup.Label>
						<div class="flex flex-wrap gap-3">
							<RadioGroup.Item value={Priority.LOW}>Low</RadioGroup.Item>
							<RadioGroup.Item value={Priority.MEDIUM}>Medium</RadioGroup.Item>
							<RadioGroup.Item value={Priority.HIGH}>High</RadioGroup.Item>
						</div>
						<Show when={upsertGoalErrors()['priority']}>
							<p class="text-destructive pt-2 text-sm">{upsertGoalErrors()['priority']}</p>
						</Show>
					</RadioGroup.Root>
					<Show when={props.goal}>
						<input name="id" type="hidden" value={props.goal!.id} />
					</Show>
					<Show when={upsertGoalErrors()['id']}>
						<p class="text-destructive text-sm">{upsertGoalErrors()['id']}</p>
					</Show>
					<Show when={props.noteToConvert}>
						<input name="noteId" type="hidden" value={props.noteToConvert!.id} />
					</Show>
					<Show when={upsertGoalErrors()['noteId']}>
						<p class="text-destructive text-sm">{upsertGoalErrors()['noteId']}</p>
					</Show>
					<Show when={upsertGoalErrors()['other']}>
						<p class="text-destructive text-sm">{upsertGoalErrors()['other']}</p>
					</Show>
					<Button class="max-w-48 w-full">{props.goal ? 'Save goal' : 'Add goal'}</Button>
				</upsertGoalTrigger.Form>
			</div>
			<Show when={props.goal}>
				<div class="my-12 flex flex-col gap-6">
					<h2 class="text-xl">Assigned tasks</h2>
					<Show when={goalCompletionStats()}>
						<div
							class="h-6 w-full overflow-hidden rounded-md shadow shadow-black/50 dark:shadow-black/90"
							role="progressbar"
							aria-valuemin={goalCompletionStats()!.min}
							aria-valuemax={goalCompletionStats()!.max}
							aria-valuenow={goalCompletionStats()!.now}
							aria-valuetext={`${goalCompletionStats()!.percent}%`}
						>
							<div
								class="bg-accent text-contrast flex h-full items-center justify-center text-sm"
								style={{ width: `${goalCompletionStats()!.percent}%` }}
							>
								<span aria-hidden>{goalCompletionStats()!.percent}%</span>
							</div>
						</div>
					</Show>

					<TasksListWithoutPagination
						goalList
						fallback="You don't have any tasks assigned to this goal yet. You can always group them for more readable and simpler view"
						tasks={props.goal!.Task ?? []}
					/>
				</div>
			</Show>
		</>
	);
};
