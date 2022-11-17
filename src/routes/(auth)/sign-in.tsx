import { randomBytes } from 'node:crypto';
import { SessionDuration } from '@prisma/client';
import { Show } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect, ServerError } from 'solid-start/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { Button } from '~/components/Button';
import { Checkbox } from '~/components/Checkbox';
import { Input } from '~/components/Input';
import { db } from '~/utils/db';
import { COMMON_FORM_ERRORS, createFormFieldsErrors } from '~/utils/formError';
import { sendEmailWithMagicLink } from '~/utils/mail';
import {
	createMagicIdentifierCookie,
	getMagicIdentifier,
	isUserSignedIn,
	MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
	MAGIC_LINK_VALIDITY_IN_MINUTES,
} from '~/utils/session';
import { getDateWithOffset } from '~/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isUserSignedIn(request)) throw redirect('/app/home');
	});

const signInSchema = zfd.formData({
	email: zfd.text(z.string().email()),
	rememberMe: zfd.checkbox(),
});

const FORM_ERRORS = {
	INVALID_EMAIL: 'Invalid email address',
	MAIL_SENDING_FAILED: 'There was a problem with sending you an email, try again',
	TOO_MANY_REQUESTS: 'Too many magic link requests for the same email address and device',
} as const;

const SignIn = () => {
	useRouteData<typeof routeData>()();

	const [signIn, signInTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		if (await isUserSignedIn(request)) throw redirect('/app/home');

		const parsedFormData = signInSchema.safeParse(formData);

		if (!parsedFormData.success) {
			const errors = parsedFormData.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: {
					...(errors.fieldErrors.email ? { email: FORM_ERRORS.INVALID_EMAIL } : {}),
					...(errors.formErrors.length ? { other: COMMON_FORM_ERRORS.INVALID_FORM_DATA } : {}),
				},
			});
		}

		const { email } = parsedFormData.data;
		const sessionDuration = parsedFormData.data.rememberMe ? SessionDuration.PERSISTENT : SessionDuration.EPHEMERAL;

		const { id: userId } = await db.user.upsert({
			create: {
				email,
			},
			update: {},
			where: {
				email,
			},
		});

		const previousMagicLink = await db.magicLink.findFirst({
			where: {
				userId: {
					equals: userId,
				},
				validUntil: {
					gte: getDateWithOffset({
						minutes: MAGIC_LINK_VALIDITY_IN_MINUTES - MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
					}).epochSeconds,
				},
			},
		});

		const magicIdentifier = await getMagicIdentifier(request);

		if (previousMagicLink && magicIdentifier) throw new FormError(FORM_ERRORS.TOO_MANY_REQUESTS);

		const token = randomBytes(32).toString('base64url');
		const { id: magicLinkId } = await db.magicLink.create({
			data: {
				sessionDuration,
				token,
				userId,
				validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
			},
		});

		try {
			await sendEmailWithMagicLink(token, email);
		} catch {
			await db.magicLink.delete({
				where: {
					id: magicLinkId,
				},
			});

			throw new ServerError(FORM_ERRORS.MAIL_SENDING_FAILED, { status: 500 });
		}

		const cookie = await createMagicIdentifierCookie(magicLinkId);

		return redirect('/', {
			headers: {
				'Set-Cookie': cookie,
			},
		});
	});

	const signInErrors = createFormFieldsErrors(() => signIn.error);

	return (
		<signInTrigger.Form method="post" class="contents">
			<Input error={signInErrors()['email']} name="email">
				Email address
			</Input>
			<Checkbox name="rememberMe">Remember me</Checkbox>
			<Show when={signInErrors()['other']}>
				<p class="text-destructive text-sm">{signInErrors()['other']}</p>
			</Show>
			<p class="text-secondary text-sm">
				You don't need to create an account, just use your email address! We'll send you a link that lets you login with
				this device. No need to remember a password!
			</p>
			<Button class="max-w-48 mx-auto w-full">Sign in</Button>
		</signInTrigger.Form>
	);
};

export default SignIn;
