declare module 'whyframe:app' {
	type WhyframeExports = {
		createApp: (element: HTMLElement) => void;
	};
	const createApp: WhyframeExports['createApp'];

	export { createApp };
}
