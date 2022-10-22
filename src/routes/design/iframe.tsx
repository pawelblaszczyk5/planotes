import { createSignal, onMount } from 'solid-js';
import { createApp } from 'whyframe:app';

const Iframe = () => {
	const [hostRef, setHostRef] = createSignal<HTMLDivElement>();

	onMount(() => {
		const hostElementRef = hostRef();

		if (!hostElementRef) return;

		createApp(hostElementRef);
	});

	return <div ref={setHostRef} />;
};

export default Iframe;
