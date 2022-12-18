import { createEffect, createSignal, Show } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/shared/components/Button';
import { db } from '~/shared/utils/db';
import { type FormErrors, convertFormDataIntoObject, createFormFieldsErrors } from '~/shared/utils/form';
import { REDIRECTS } from '~/shared/utils/redirects';
import { createSessionCookie, getMagicIdentifier, isSignedIn } from '~/shared/utils/session';
import { isDateInPast, convertEpochSecondsToDate } from '~/shared/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const token = new URL(request.url).searchParams.get('token');

		if (!token) throw redirect(REDIRECTS.SIGN_IN);

		return token;
	});

const redeemMagicTokenSchema = z.object({
	token: z.string(),
});

const FORM_ERRORS = {
	EXPIRED_TOKEN: 'Provided token has already expired or been used, sign in again',
	INVALID_DEVICE: "Provided token can't be matched with your device sign in again",
	INVALID_TOKEN: 'Provided token is invalid, sign in again',
} as const satisfies FormErrors;

const Magic = () => {
	const tokenFromUrl = useRouteData<typeof routeData>();

	const [formRef, setFormRef] = createSignal<HTMLFormElement>();

	const [redeemMagicToken, redeemMagicTokenTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const parsedFormData = redeemMagicTokenSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedFormData.success) throw new FormError(FORM_ERRORS.INVALID_TOKEN);

		const magicIdentifierId = await getMagicIdentifier(request);

		if (!magicIdentifierId) throw new FormError(FORM_ERRORS.INVALID_DEVICE);

		const userProvidedToken = parsedFormData.data.token;

		const magicLink = await db.magicLink.findUnique({
			where: { id: magicIdentifierId },
		});

		if (!magicLink) throw new FormError(FORM_ERRORS.INVALID_TOKEN);

		const { validUntil, token, userId, sessionDuration, id } = magicLink;

		if (isDateInPast(convertEpochSecondsToDate(validUntil)) || userProvidedToken !== token)
			throw new FormError(FORM_ERRORS.EXPIRED_TOKEN);

		const cookie = await createSessionCookie({ request, sessionDuration, userId });

		await db.magicLink.delete({ where: { id } });

		return redirect(REDIRECTS.HOME, { headers: { 'Set-Cookie': cookie } });
	});

	const redeemMagicTokenErrors = createFormFieldsErrors(() => redeemMagicToken.error);

	createEffect(() => {
		const timeoutRef = setTimeout(() => {
			const formData = new FormData(formRef());

			if (!Object.keys(redeemMagicTokenErrors()).length) void redeemMagicTokenTrigger(formData);
		}, 1_000);

		return () => clearTimeout(timeoutRef);
	});

	return (
		<redeemMagicTokenTrigger.Form method="post" ref={setFormRef} class="contents">
			<p class="text-secondary text-sm">
				You'll be signed in and redirected to the application automatically. In case of problems you can also press the
				below button yourself
			</p>
			<Show when={redeemMagicTokenErrors()['other']}>
				<p class="text-destructive text-sm">{redeemMagicTokenErrors()['other']}</p>
			</Show>
			<input name="token" type="hidden" value={tokenFromUrl() ?? ''} />
			<Button class="max-w-48 mx-auto w-full">Sign in</Button>
		</redeemMagicTokenTrigger.Form>
	);
};

export default Magic;
