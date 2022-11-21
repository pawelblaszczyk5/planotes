import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps } from '@zag-js/solid';
import { createMemo, createUniqueId, type JSXElement, mergeProps, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

type DialogProps = {
	children: JSXElement;
	description: JSXElement;
	preventExit?: boolean;
	title: JSXElement;
};

const DEFAULT_DIALOG_PROPS = {
	preventExit: false,
} as const;

export const Dialog = (props: DialogProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_DIALOG_PROPS, props);

	const [state, send] = useMachine(
		dialog.machine({
			// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
			closeOnEsc: !propsWithDefaults.preventExit,
			// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
			closeOnOutsideClick: !propsWithDefaults.preventExit,
			defaultOpen: true,
			id: createUniqueId(),
		}),
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	return (
		<Show when={api().isOpen}>
			<Portal>
				<div class="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" {...api().backdropProps} />
				<div
					{...api().underlayProps}
					class="fixed top-1/2 left-1/2 z-20 max-h-[calc(100%-4rem)] w-[calc(100%-4rem)] max-w-2xl translate-y--1/2 translate-x--1/2"
				>
					<div {...api().contentProps} class="bg-primary rounded-md p-8 shadow-md shadow-black/50 dark:shadow-black/90">
						<h3 class="b-b-2  b-primary mb-4 pb-2 text-3xl font-semibold" {...api().titleProps}>
							{propsWithDefaults.title}
						</h3>
						<p class="text-secondary mb-6 text-sm" {...api().descriptionProps}>
							{propsWithDefaults.description}
						</p>
						{propsWithDefaults.children}
						<button class="fixed top-2 right-2 grid h-10 w-10 place-items-center" {...api().closeButtonProps}>
							<i class="i-lucide-x" aria-label="Close" />
						</button>
					</div>
				</div>
			</Portal>
		</Show>
	);
};
