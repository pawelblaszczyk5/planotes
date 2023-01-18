import { createEffect, createSignal, Show } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import { type FormErrors, convertFormDataIntoObject, createFormFieldsErrors } from '~/utils/form';
import {
	createRemoveMagicIdentifierCookie,
	createSessionCookie,
	getMagicIdentifier,
	isSignedIn,
} from '~/utils/session';
import { isDateInPast, convertEpochSecondsToDate } from '~/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const token = new URL(request.url).searchParams.get('token');

		if (!token) throw redirect(REDIRECTS.SIGN_IN);

		return token;
	});

const FORM_ERRORS = {
	DEVICE_INVALID: "Provided token can't be matched with your device sign in again",
	TOKEN_EXPIRED: 'Provided token has already expired or been used, sign in again',
	TOKEN_INVALID: 'Provided token is invalid, sign in again',
} as const satisfies FormErrors;

const Magic = () => {
	const tokenFromUrl = useRouteData<typeof routeData>();

	const [formRef, setFormRef] = createSignal<HTMLFormElement>();

	const [redeemMagicToken, redeemMagicTokenTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const redeemMagicTokenSchema = z.object({
			token: z.string(),
		});

		const parsedFormData = redeemMagicTokenSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedFormData.success) throw new FormError(FORM_ERRORS.TOKEN_INVALID);

		const magicIdentifierId = await getMagicIdentifier(request);

		if (!magicIdentifierId) throw new FormError(FORM_ERRORS.DEVICE_INVALID);

		const userProvidedToken = parsedFormData.data.token;

		const magicLink = await db.magicLink.findUnique({
			where: { id: magicIdentifierId },
		});

		if (!magicLink) throw new FormError(FORM_ERRORS.TOKEN_INVALID);

		const { validUntil, token, userId, sessionDuration, id } = magicLink;

		if (isDateInPast(convertEpochSecondsToDate(validUntil)) || userProvidedToken !== token)
			throw new FormError(FORM_ERRORS.TOKEN_EXPIRED);

		const [sessionCookie, magicTokenCookie] = await Promise.all([
			await createSessionCookie({ request, sessionDuration, userId }),
			await createRemoveMagicIdentifierCookie(),
			db.magicLink.delete({ where: { id } }),
		]);

		const headers = new Headers();

		headers.append('Set-Cookie', magicTokenCookie);
		headers.append('Set-Cookie', sessionCookie);

		return redirect(REDIRECTS.HOME, { headers });
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
