import { createSignal, onMount } from 'solid-js';
import { useSearchParams } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { verifyMagicToken } from '~/utils/session';

const Magic = () => {
	// TODO: verify and parse params in routeData maybe?
	const [params] = useSearchParams();

	const [formRef, setFormRef] = createSignal<HTMLFormElement>();

	const [verifyMagicData, verifyMagicTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		// TODO: proper validation etc
		const token = formData.get('token') as string;
		const cookie = await verifyMagicToken(token, request);

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
