import { getWhyframeSource } from '@whyframe/core/utils';
import { getHighlighter, loadTheme } from 'shiki';
import { createSignal, onMount, type JSXElement } from 'solid-js';
import server$ from 'solid-start/server';

const highlightedSrc = server$(async (sourceToHighlight: string) => {
	// Idk why this src must be like this
	const THEME_SRC = '../../../../../apps/design/public/vitesse-dark-soft.json';
	const theme = await loadTheme(THEME_SRC);
	const highlighter = await getHighlighter({ theme });

	return highlighter.codeToHtml(sourceToHighlight, { lang: 'tsx' });
});

// It's not an arrow function cause of Whyframe issue
export const Story = function (props: { children: JSXElement; title: string }) {
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement>();
	const [source, setSource] = createSignal('');

	onMount(async () => {
		const iframeElementRef = iframeRef();

		if (!iframeElementRef) return;

		const bla = await highlightedSrc(getWhyframeSource(iframeElementRef) ?? '');
		setSource(bla);
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
