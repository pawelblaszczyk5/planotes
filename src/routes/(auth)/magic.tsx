import { createEffect, createSignal, Show } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { zfd } from 'zod-form-data';
import { Button } from '~/components/Button';
import { db } from '~/utils/db';
import { createFormFieldsErrors } from '~/utils/formError';
import { REDIRECTS } from '~/utils/redirects';
import { createSessionCookie, getMagicIdentifier, isUserSignedIn } from '~/utils/session';
import { isDateInPast, convertEpochSecondsToDate } from '~/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isUserSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const token = new URL(request.url).searchParams.get('token');

		if (!token) throw redirect(REDIRECTS.MAIN);

		return token;
	});

const redeemMagicTokenSchema = zfd.formData({
	token: zfd.text(),
});

const FORM_ERRORS = {
	EXPIRED_TOKEN: 'Provided token has already expired or been used, sign in again',
	INVALID_DEVICE: "Provided token can't be matched with your device sign in again",
	INVALID_TOKEN: 'Provided token is invalid, sign in again',
} as const;

const Magic = () => {
	const tokenFromUrl = useRouteData<typeof routeData>();

	const [formRef, setFormRef] = createSignal<HTMLFormElement>();

	const [redeemMagicToken, redeemMagicTokenTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const parsedFormData = redeemMagicTokenSchema.safeParse(formData);

		if (!parsedFormData.success) throw new FormError(FORM_ERRORS.INVALID_TOKEN);

		const magicIdentifierId = await getMagicIdentifier(request);

		if (!magicIdentifierId) throw new FormError(FORM_ERRORS.INVALID_DEVICE);

		const userProvidedToken = parsedFormData.data.token;

		const magicLink = await db.magicLink.findUnique({
			where: { id: magicIdentifierId },
		});

		if (!magicLink) throw new FormError(FORM_ERRORS.INVALID_TOKEN);

		const { validUntil, token, userId, sessionDuration } = magicLink;

		if (isDateInPast(convertEpochSecondsToDate(validUntil)) || userProvidedToken !== token)
			throw new FormError(FORM_ERRORS.EXPIRED_TOKEN);

		const cookie = await createSessionCookie({ request, sessionDuration, userId });

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
