import { getWhyframeSource } from '@whyframe/core/utils';
import { createSignal, onMount, type JSXElement } from 'solid-js';

// It's not an arrow function cause of Whyframe bug
export const Story = function (props: { children: JSXElement; title: string }) {
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement>();
	const [src, setSrc] = createSignal('');

	onMount(() => {
		const iframeElementRef = iframeRef();

		if (!iframeElementRef) return;

		setSrc(getWhyframeSource(iframeElementRef) ?? '');
	});

	return (
		<>
			<iframe data-why title={props.title} ref={setIframeRef}>
				{props.children}
			</iframe>
			<p>{src()}</p>
		</>
	);
};
