import { createSignal, onMount } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect } from 'solid-start/server';
import { db } from '~/utils/db';
import { createSessionCookie, getMagicIdentifier, isUserSignedIn } from '~/utils/session';
import { isDateInPast, convertEpochSecondsToDate } from '~/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isUserSignedIn(request)) throw redirect('/app/home');

		const token = new URL(request.url).searchParams.get('token');

		if (!token) throw redirect('');

		return token;
	});

const Magic = () => {
	const tokenFromUrl = useRouteData<typeof routeData>();

	const [formRef, setFormRef] = createSignal<HTMLFormElement>();

	const [verifyMagicData, verifyMagicTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		// TODO: proper validation etc
		const userProvidedToken = formData.get('token') as string;
		const magicIdentifierId = await getMagicIdentifier(request);

		if (!magicIdentifierId) throw new FormError('Error');

		const magicLink = await db.magicLink.findUnique({
			where: { id: magicIdentifierId },
		});

		if (!magicLink) throw new FormError('Error');

		const { validUntil, token, userId, sessionDuration } = magicLink;

		if (isDateInPast(convertEpochSecondsToDate(validUntil)) || userProvidedToken !== token)
			throw new FormError('error');

		const cookie = await createSessionCookie({ request, sessionDuration, userId });

		return redirect('/app/home', { headers: { 'Set-Cookie': cookie } });
	});

	onMount(() => {
		if (!verifyMagicData.error) formRef()?.submit();
	});

	return (
		<verifyMagicTrigger.Form method="post" ref={setFormRef}>
			<input name="token" type="hidden" value={tokenFromUrl() ?? ''} />
		</verifyMagicTrigger.Form>
	);
};

export default Magic;
