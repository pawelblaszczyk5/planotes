import { type JSXElement } from 'solid-js';

export const AppMainLayout = (props: { children: JSXElement; heading: JSXElement }) => (
	<div class="flex flex-col gap-6">
		<h1 class="text-3xl">{props.heading}</h1>
		{props.children}
	</div>
);
