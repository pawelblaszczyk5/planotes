import { getWhyframeSource } from '@whyframe/core/utils';
import { createSignal, onMount } from 'solid-js';

const Button = () => {
	const [iframeRef, setIframeRef] = createSignal<HTMLIFrameElement>();
	const [src, setSrc] = createSignal('');

	onMount(() => {
		const iframeElementRef = iframeRef();

		if (!iframeElementRef) return;

		setSrc(getWhyframeSource(iframeElementRef) ?? '');
	});

	return (
		<>
			<iframe ref={setIframeRef} data-why-show-source data-why title="Button preview">
				<button>Click me</button>
			</iframe>
			{src()}
		</>
	);
};

export default Button;
