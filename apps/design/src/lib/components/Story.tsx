import { type Rpc, getWhyframeSource, createIframeRpc } from '@whyframe/core/utils';
import { createSignal, onCleanup, onMount, type JSXElement } from 'solid-js';
import server$ from 'solid-start/server';
import { highlightCode } from '~/lib/utils/highlighting';

const highlightedSrc = server$(async (src: string) => highlightCode(src));

// TODO: Change into an arrow function after https://github.com/bluwy/whyframe/issues/16
export const Story = function (props: { children: JSXElement; title: string }) {
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement>();
	const [source, setSource] = createSignal('');

	let outsideRpc: Rpc;

	const handleColorSchemeChange = () => outsideRpc?.send('swapColorScheme', null);

	onMount(async () => {
		const iframeElementRef = iframeRef();

		if (!iframeElementRef) return;

		outsideRpc = createIframeRpc(iframeElementRef);
		setSource(await highlightedSrc(getWhyframeSource(iframeElementRef) ?? ''));

		onCleanup(() => outsideRpc?.teardown());
	});

	return (
		<div>
			<iframe data-why title={props.title} ref={setIframeRef}>
				{props.children}
			</iframe>
			<button onClick={handleColorSchemeChange}>Swap color scheme</button>
			<div class="bg-[#222] p-4" innerHTML={source()} />
		</div>
	);
};
