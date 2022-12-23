import { COMPLETABLE_STATUS } from '@prisma/client';
import clsx from 'clsx';
import { For, mergeProps } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Menu } from '~/components/Menu';
import { REDIRECTS } from '~/constants/redirects';
import { type DefaultProps } from '~/types';
import { db } from '~/utils/db';
import { type FormErrors, convertFormDataIntoObject } from '~/utils/form';
import { requireUserId } from '~/utils/session';

type TaskStatusMenuProps = {
	class?: string;
	currentStatus: COMPLETABLE_STATUS;
	id: string;
};

const FORM_ERRORS = {
	TRANSITION_ERROR: 'There was an error during transition',
} as const satisfies FormErrors;

const STATUS_LABEL = {
	[COMPLETABLE_STATUS.COMPLETED]: 'Completed',
	[COMPLETABLE_STATUS.IN_PROGRESS]: 'In progress',
	[COMPLETABLE_STATUS.TO_DO]: 'To do',
	[COMPLETABLE_STATUS.ARCHIVED]: 'Archived',
} as const;

const availableTransitions = (status: COMPLETABLE_STATUS): Array<COMPLETABLE_STATUS> => {
	switch (status) {
		case 'ARCHIVED':
			return [];
		case 'COMPLETED':
			return [];
		case 'IN_PROGRESS':
			return [COMPLETABLE_STATUS.COMPLETED, COMPLETABLE_STATUS.TO_DO, COMPLETABLE_STATUS.ARCHIVED];
		case 'TO_DO':
			return [COMPLETABLE_STATUS.IN_PROGRESS, COMPLETABLE_STATUS.COMPLETED, COMPLETABLE_STATUS.ARCHIVED];
		default:
			throw new Error('Invalid status');
	}
};

const DEFAULTS_TASK_STATUS_MENU_PROPS = {
	class: '',
} as const satisfies DefaultProps<TaskStatusMenuProps>;

export const TaskStatusMenu = (props: TaskStatusMenuProps) => {
	const propsWithDefaults = mergeProps(DEFAULTS_TASK_STATUS_MENU_PROPS, props);
	const [, changeStatusTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);
		const changeStatusSchema = z.object({
			id: z.string().cuid(),
			status: z.enum([
				COMPLETABLE_STATUS.ARCHIVED,
				COMPLETABLE_STATUS.COMPLETED,
				COMPLETABLE_STATUS.TO_DO,
				COMPLETABLE_STATUS.IN_PROGRESS,
			]),
		});

		const parsedChangeStatusPayload = changeStatusSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedChangeStatusPayload.success) throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const currentlyEditingTask = await db.task.findUnique({
			select: {
				status: true,
				userId: true,
			},
			where: {
				id: parsedChangeStatusPayload.data.id,
			},
		});

		if (!currentlyEditingTask || currentlyEditingTask.userId !== userId)
			throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const isTransitionValid = availableTransitions(currentlyEditingTask.status).includes(
			parsedChangeStatusPayload.data.status,
		);

		if (!isTransitionValid) throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		await db.task.update({
			data: {
				status: parsedChangeStatusPayload.data.status,
			},
			where: { id: parsedChangeStatusPayload.data.id },
		});

		if (parsedChangeStatusPayload.data.status === 'ARCHIVED' || parsedChangeStatusPayload.data.status === 'COMPLETED')
			return redirect(REDIRECTS.TASKS);

		// TODO: Add valid check for all of these redirects
		return redirect(request.headers.get('referer') ?? REDIRECTS.TASKS);
	});

	return (
		<div class={clsx('relative', propsWithDefaults.class)}>
			<Menu.Root triggerContent={STATUS_LABEL[propsWithDefaults.currentStatus]}>
				<changeStatusTrigger.Form>
					<input type="hidden" name="id" value={propsWithDefaults.id} />
					<For each={availableTransitions(propsWithDefaults.currentStatus)}>
						{status => (
							<Menu.ButtonItem name="status" value={status} id={status}>
								{STATUS_LABEL[status]}
							</Menu.ButtonItem>
						)}
					</For>
				</changeStatusTrigger.Form>
			</Menu.Root>
		</div>
	);
};
