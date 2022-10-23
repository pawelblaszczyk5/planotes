import { randomBytes } from 'node:crypto';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { db } from '~/lib/main/utils/db';
import { sendEmailWithMagicLink } from '~/lib/main/utils/mail';
import {
	createMagicIdentifierCookie,
	MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
	MAGIC_LINK_VALIDITY_IN_MINUTES,
} from '~/lib/main/utils/session';
import { getDateWithOffset } from '~/lib/main/utils/time';

const Login = () => {
	const [, sendMagicLinkTrigger] = createServerAction$(async (formData: FormData) => {
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

			throw new FormError('Error');
		}

		const cookie = await createMagicIdentifierCookie(magicLinkId);

		return redirect('/', {
			headers: {
				'Set-Cookie': cookie,
			},
		});
	});

	return (
		<sendMagicLinkTrigger.Form method="post">
			<label for="email">Email address</label>
			<input id="email" type="email" name="email" />
			<label for="persistent">Persistent session</label>
			<input id="persistent" checked={true} type="radio" name="sessionDuration" value="PERSISTENT" />
			<label for="ephemeral">Ephemeral session</label>
			<input id="ephemeral" type="radio" name="sessionDuration" value="EPHEMERAL" />
		</sendMagicLinkTrigger.Form>
	);
};

export default Login;
