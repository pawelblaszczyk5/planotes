import { normalizeProps, useMachine } from '@zag-js/solid';
import * as tabs from '@zag-js/tabs';
import clsx from 'clsx';
import { type JSXElement, createMemo, createUniqueId, For } from 'solid-js';

export type TabItem = {
	content: JSXElement;
	title: JSXElement;
	value: string;
};

type TabsProps = {
	class?: string;
	items: Array<TabItem>;
};

export const Tabs = (props: TabsProps) => {
	// eslint-disable-next-line solid/reactivity
	const [state, send] = useMachine(tabs.machine({ id: createUniqueId(), value: props.items[0]?.value ?? null }));

	const api = createMemo(() => tabs.connect(state, send, normalizeProps));

	return (
		<div class={clsx('', props.class)} {...api().rootProps}>
			<div class="flex items-center overflow-x-scroll pb-6" {...api().tablistProps}>
				<For each={props.items}>
					{item => (
						<button
							class="ring-primary [&[data-selected]]:b-accent b-b-2 b-primary px-6 py-3 text-lg"
							{...api().getTriggerProps({ value: item.value })}
						>
							{item.title}
						</button>
					)}
				</For>
			</div>
			<For each={props.items}>
				{item => (
					<div class="ring-primary" {...api().getContentProps({ value: item.value })}>
						<p>{item.content}</p>
					</div>
				)}
			</For>
		</div>
	);
};
