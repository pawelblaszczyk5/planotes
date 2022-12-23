import { CompletableStatus } from '@prisma/client';
import clsx from 'clsx';
import { createEffect, For, mergeProps, Show } from 'solid-js';
import { FormError, refetchRouteData } from 'solid-start';
import { createServerAction$, json, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Menu } from '~/components/Menu';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { AVAILABLE_TRANSITIONS, STATUS_ICON, STATUS_LABEL } from '~/constants/completableStatus';
import { REDIRECTS } from '~/constants/redirects';
import { type DefaultProps } from '~/types';
import { calculatePayout } from '~/utils/calculatePayout';
import { db } from '~/utils/db';
import { type FormErrors, convertFormDataIntoObject, isFormRequestClientSide } from '~/utils/form';
import { sanitizeRefererRedirect } from '~/utils/refererRedirect';
import { requireUserId } from '~/utils/session';
import { getCurrentEpochSeconds } from '~/utils/time';

type TaskStatusMenuProps = {
	class?: string;
	currentStatus: CompletableStatus;
	goalList?: boolean;
	id: string;
};

const FORM_ERRORS = {
	TRANSITION_ERROR: 'There was an error during transition',
} as const satisfies FormErrors;

const DEFAULTS_TASK_STATUS_MENU_PROPS = {
	class: '',
} as const satisfies DefaultProps<TaskStatusMenuProps>;

export const TaskStatusMenu = (props: TaskStatusMenuProps) => {
	const propsWithDefaults = mergeProps(DEFAULTS_TASK_STATUS_MENU_PROPS, props);
	const [changeStatus, changeStatusTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);
		const changeStatusSchema = z.object({
			goalsList: z.coerce.boolean().optional(),
			id: z.string().cuid(),
			status: z.enum([
				CompletableStatus.ARCHIVED,
				CompletableStatus.COMPLETED,
				CompletableStatus.TO_DO,
				CompletableStatus.IN_PROGRESS,
			]),
		});

		const parsedChangeStatusPayload = changeStatusSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedChangeStatusPayload.success) throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const currentlyEditingTask = await db.task.findUnique({
			select: {
				goal: true,
				size: true,
				status: true,
				userId: true,
			},
			where: {
				id: parsedChangeStatusPayload.data.id,
			},
		});

		if (!currentlyEditingTask || currentlyEditingTask.userId !== userId)
			throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const isTransitionValid = AVAILABLE_TRANSITIONS[currentlyEditingTask.status].includes(
			// @ts-expect-error - I don't get this error tbh, it's kinda stupid
			parsedChangeStatusPayload.data.status,
		);

		if (!isTransitionValid) throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const promises: Array<Promise<unknown>> = [
			db.task.update({
				data: {
					status: parsedChangeStatusPayload.data.status,
				},
				where: { id: parsedChangeStatusPayload.data.id },
			}),
		];

		if (currentlyEditingTask.goal?.status === 'TO_DO' && parsedChangeStatusPayload.data.status === 'IN_PROGRESS') {
			promises.push(
				db.goal.update({
					data: {
						status: 'IN_PROGRESS',
					},
					where: {
						id: currentlyEditingTask.goal.id,
					},
				}),
			);
		}

		if (parsedChangeStatusPayload.data.status === 'COMPLETED') {
			const payout = calculatePayout('task', currentlyEditingTask.size);

			promises.push(
				db.balanceEntry.create({
					data: {
						change: payout,
						createdAt: getCurrentEpochSeconds(),
						entity: 'TASK',
						itemId: parsedChangeStatusPayload.data.id,
						userId,
					},
				}),
			);

			promises.push(
				db.user.update({
					data: {
						balance: {
							increment: payout,
						},
					},
					where: {
						id: userId,
					},
				}),
			);
		}

		await Promise.all(promises);

		if (
			!parsedChangeStatusPayload.data.goalsList &&
			(parsedChangeStatusPayload.data.status === 'ARCHIVED' || parsedChangeStatusPayload.data.status === 'COMPLETED')
		)
			return redirect(REDIRECTS.TASKS);

		if (isFormRequestClientSide(request)) return json({});

		return redirect(sanitizeRefererRedirect(request, REDIRECTS.TASKS));
	});

	createEffect(() => {
		if (!changeStatus.result) return;

		void refetchRouteData();
	});

	return (
		<div class={clsx('text-primary relative text-base', propsWithDefaults.class)}>
			<Menu.Root
				triggerContent={
					<TextAlignedIcon icon={STATUS_ICON[propsWithDefaults.currentStatus]}>
						{STATUS_LABEL[propsWithDefaults.currentStatus]}
					</TextAlignedIcon>
				}
				class="w-full"
			>
				<changeStatusTrigger.Form>
					<input type="hidden" name="id" value={propsWithDefaults.id} />
					<Show when={propsWithDefaults.goalList}>
						<input type="hidden" name="goalsList" value="true" />
					</Show>
					<For each={AVAILABLE_TRANSITIONS[propsWithDefaults.currentStatus]}>
						{status => (
							<Menu.ButtonItem name="status" value={status} id={status}>
								<TextAlignedIcon icon={STATUS_ICON[status]}>{STATUS_LABEL[status]}</TextAlignedIcon>
							</Menu.ButtonItem>
						)}
					</For>
				</changeStatusTrigger.Form>
			</Menu.Root>
		</div>
	);
};
