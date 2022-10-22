import { createSignal, onMount } from 'solid-js';
import { createApp } from 'whyframe:app';

const Iframe = () => {
	const [hostRef, setHostRef] = createSignal<HTMLDivElement>();

	onMount(() => {
		if (import.meta.env.SSR) return;

		const hostElementRef = hostRef();

		if (hostElementRef) createApp(hostElementRef);
	});

	return <div ref={setHostRef} />;
};

export default Iframe;
