import { createServerAction$, redirect } from 'solid-start/server';
import { sendMagicLink } from '~/utils/session';

const Login = () => {
	const [sendMagicLinkData, sendMagicLinkTrigger] = createServerAction$(async (formData: FormData) => {
		// TODO: proper validation etc
		const email = formData.get('email') as string;
		const sessionDuration = formData.get('sessionDuration') as 'EPHEMERAL' | 'PERSISTENT';
		const cookie = await sendMagicLink(email, sessionDuration);

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
