import { randomBytes } from 'node:crypto';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect, ServerError } from 'solid-start/server';
import { Button } from '~/lib/components/Button';
import { Input } from '~/lib/components/Input';
import { RadioGroup } from '~/lib/components/Radio';
import { db } from '~/lib/utils/db';
import { sendEmailWithMagicLink } from '~/lib/utils/mail';
import {
	createMagicIdentifierCookie,
	isUserSignedIn,
	MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
	MAGIC_LINK_VALIDITY_IN_MINUTES,
} from '~/lib/utils/session';
import { getDateWithOffset } from '~/lib/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isUserSignedIn(request)) throw redirect('/app/home');
	});

const Login = () => {
	useRouteData<typeof routeData>()();

	const [, sendMagicLinkTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		// TODO: change to proper redirect URL
		if (await isUserSignedIn(request)) throw redirect('/');
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
		<sendMagicLinkTrigger.Form method="post" class="flex max-w-2xl flex-col p-16">
			<Input name="email">Email address</Input>
			<RadioGroup.Root defaultValue="PERSISTENT" name="sessionDuration">
				<RadioGroup.Label>Session duration</RadioGroup.Label>
				<RadioGroup.Item value="PERSISTENT">Persistent</RadioGroup.Item>
				<RadioGroup.Item value="EPHEMERAL">Ephemeral</RadioGroup.Item>
			</RadioGroup.Root>
			<Button>Sign in</Button>
			{/* <label for="email">Email address</label>
			<input id="email" type="email" name="email" />
			<label for="persistent">Persistent session</label>
			<input id="persistent" checked={true} type="radio" name="sessionDuration" value="PERSISTENT" />
			<label for="ephemeral">Ephemeral session</label>
			<input id="ephemeral" type="radio" name="sessionDuration" value="EPHEMERAL" />
			<button>Login</button> */}
		</sendMagicLinkTrigger.Form>
	);
};

export default Login;
