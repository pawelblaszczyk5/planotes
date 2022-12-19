import { type JSXElement } from 'solid-js';

export const AppMainLayout = (props: { children: JSXElement; heading: JSXElement }) => (
	<div class="flex flex-col">
		<h1 class="mb-6 text-3xl">{props.heading}</h1>
		{props.children}
	</div>
);
