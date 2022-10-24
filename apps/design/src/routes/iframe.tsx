import { createIframeRpc } from '@whyframe/core/utils';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { createApp } from 'whyframe:app';

const createInsideRpcHandler = () => {
	const insideRpc = createIframeRpc();

	insideRpc.on('swapColorScheme', () => {
		document.documentElement.classList.toggle('dark');
	});

	onCleanup(() => {
		insideRpc.teardown();
	});
};

const Iframe = () => {
	const [hostRef, setHostRef] = createSignal<HTMLDivElement>();

	onMount(() => {
		if (import.meta.env.SSR) return;

		document.body.classList.add('text-primary', 'bg-primary');

		const hostElementRef = hostRef();

		if (hostElementRef) {
			createApp(hostElementRef);
			createInsideRpcHandler();
		}
	});

	return <div ref={setHostRef} />;
};

export default Iframe;
