import { getWhyframeSource } from '@whyframe/core/utils';
import { createSignal, onMount, type JSXElement } from 'solid-js';
import server$ from 'solid-start/server';
import { highlightCode } from '~/lib/utils/highlighting';

const highlightedSrc = server$(async (src: string) => highlightCode(src));

// It's not an arrow function cause of Whyframe issue
export const Story = function (props: { children: JSXElement; title: string }) {
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement>();
	const [source, setSource] = createSignal('');

	onMount(async () => {
		const iframeElementRef = iframeRef();

		if (!iframeElementRef) return;

		setSource(await highlightedSrc(getWhyframeSource(iframeElementRef) ?? ''));
	});

	return (
		<div>
			<iframe data-why title={props.title} ref={setIframeRef}>
				{props.children}
			</iframe>
			<div class="bg-[#222] p-4" innerHTML={source()} />
		</div>
	);
};
