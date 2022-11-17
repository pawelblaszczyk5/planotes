import { randomBytes } from 'node:crypto';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect, ServerError } from 'solid-start/server';
import { Button } from '~/components/Button';
import { Checkbox } from '~/components/Checkbox';
import { Input } from '~/components/Input';
import { db } from '~/utils/db';
import { sendEmailWithMagicLink } from '~/utils/mail';
import {
	createMagicIdentifierCookie,
	isUserSignedIn,
	MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
	MAGIC_LINK_VALIDITY_IN_MINUTES,
} from '~/utils/session';
import { getDateWithOffset } from '~/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isUserSignedIn(request)) throw redirect('/app/home');
	});

const SignIn = () => {
	useRouteData<typeof routeData>()();

	const [, sendMagicLinkTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		// TODO: change to proper redirect URL
		if (await isUserSignedIn(request)) throw redirect('/app/home');
		// TODO: proper validation etc
		const email = formData.get('email') as string;
		const sessionDuration = formData.get('sessionDuration') as 'EPHEMERAL' | 'PERSISTENT';

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

		// TODO: check if user browser is the same
		if (previousMagicLink) throw new FormError('Error');

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

			throw new ServerError('Error', { status: 500 });
		}

		const cookie = await createMagicIdentifierCookie(magicLinkId);

		return redirect('/', {
			headers: {
				'Set-Cookie': cookie,
			},
		});
	});

	return (
		<sendMagicLinkTrigger.Form method="post" class="contents">
			<Input name="email">Email address</Input>
			<Checkbox name="rememberMe">Remember me?</Checkbox>
			<p class="text-secondary text-sm">
				You don't need to create an account, just use your email address! We'll send you a link that let's you login
				with this device. No need to remember a password!
			</p>
			<Button class="max-w-48 mx-auto w-full">Sign in</Button>
		</sendMagicLinkTrigger.Form>
	);
};

export default SignIn;
