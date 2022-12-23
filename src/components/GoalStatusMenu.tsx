import { COMPLETABLE_STATUS } from '@prisma/client';
import clsx from 'clsx';
import { createEffect, For, mergeProps } from 'solid-js';
import { FormError, refetchRouteData } from 'solid-start';
import { createServerAction$, json, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Menu } from '~/components/Menu';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { AVAILABLE_TRANSITIONS, STATUS_ICON, STATUS_LABEL } from '~/constants/completableStatus';
import { REDIRECTS } from '~/constants/redirects';
import { type DefaultProps } from '~/types';
import { db } from '~/utils/db';
import { type FormErrors, convertFormDataIntoObject, isFormRequestClientSide } from '~/utils/form';
import { requireUserId } from '~/utils/session';

type GoalStatusMenuProps = {
	class?: string;
	currentStatus: COMPLETABLE_STATUS;
	id: string;
};

const FORM_ERRORS = {
	TRANSITION_ERROR: 'There was an error during transition',
} as const satisfies FormErrors;

const DEFAULTS_GOAL_STATUS_MENU_PROPS = {
	class: '',
} as const satisfies DefaultProps<GoalStatusMenuProps>;

export const GoalStatusMenu = (props: GoalStatusMenuProps) => {
	const propsWithDefaults = mergeProps(DEFAULTS_GOAL_STATUS_MENU_PROPS, props);
	const [changeStatus, changeStatusTrigger] = createServerAction$(async (formData: FormData, { request }) => {
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

		const currentlyEditingGoal = await db.goal.findUnique({
			select: {
				status: true,
				userId: true,
			},
			where: {
				id: parsedChangeStatusPayload.data.id,
			},
		});

		if (!currentlyEditingGoal || currentlyEditingGoal.userId !== userId)
			throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		const isTransitionValid = AVAILABLE_TRANSITIONS[currentlyEditingGoal.status].includes(
			// @ts-expect-error - I don't get this error tbh, it's kinda stupid
			parsedChangeStatusPayload.data.status,
		);

		if (!isTransitionValid) throw new FormError(FORM_ERRORS.TRANSITION_ERROR);

		await db.goal.update({
			data: {
				status: parsedChangeStatusPayload.data.status,
			},
			where: { id: parsedChangeStatusPayload.data.id },
		});

		if (parsedChangeStatusPayload.data.status === 'ARCHIVED' || parsedChangeStatusPayload.data.status === 'COMPLETED')
			return redirect(REDIRECTS.GOALS);

		if (isFormRequestClientSide(request)) return json({});

		// TODO: Add valid check for all of these redirects
		return redirect(request.headers.get('referer') ?? REDIRECTS.GOALS);
	});

	createEffect(() => {
		if (!changeStatus.result) return;

		void refetchRouteData();
	});

	return (
		<div class={clsx('relative', propsWithDefaults.class)}>
			<Menu.Root
				triggerContent={
					<TextAlignedIcon icon={STATUS_ICON[propsWithDefaults.currentStatus]}>
						{STATUS_LABEL[propsWithDefaults.currentStatus]}
					</TextAlignedIcon>
				}
			>
				<changeStatusTrigger.Form>
					<input type="hidden" name="id" value={propsWithDefaults.id} />
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
