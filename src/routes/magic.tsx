import { onMount } from 'solid-js';
import { useSearchParams } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { verifyMagicToken } from '~/utils/session';

const Magic = () => {
	// TODO: verify and parse params in routeData maybe?
	const [params] = useSearchParams();

	let form: HTMLFormElement | undefined;

	const [verifyMagicData, verifyMagicTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		// TODO: proper validation etc
		const token = formData.get('token') as string;
		const cookie = await verifyMagicToken(token, request);

		return redirect('/', { headers: { 'Set-Cookie': cookie } });
	});

	onMount(() => {
		if (!verifyMagicData.error) form?.submit();
	});

	return (
		<verifyMagicTrigger.Form method="post" ref={elRef => (form = elRef)}>
			<input name="token" type="hidden" value={params['token'] ?? ''} />
		</verifyMagicTrigger.Form>
	);
};

export default Magic;
