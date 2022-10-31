import { createSignal, onMount } from 'solid-js';
import { FormError, useSearchParams } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { db } from '~/lib/utils/db';
import { createSessionCookie, getMagicIdentifier } from '~/lib/utils/session';
import { isDateInPast, convertEpochSecondsToDate } from '~/lib/utils/time';

const Magic = () => {
	// TODO: verify and parse params in routeData maybe?
	const [params] = useSearchParams();

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

		return redirect('/', { headers: { 'Set-Cookie': cookie } });
	});

	onMount(() => {
		if (!verifyMagicData.error) formRef()?.submit();
	});

	return (
		<verifyMagicTrigger.Form method="post" ref={setFormRef}>
			<input name="token" type="hidden" value={params['token'] ?? ''} />
		</verifyMagicTrigger.Form>
	);
};

export default Magic;
