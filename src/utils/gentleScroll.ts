export const gentleScroll = (element: HTMLElement) =>
	element.scrollIntoView({
		behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
		block: 'nearest',
		inline: 'nearest',
	});
