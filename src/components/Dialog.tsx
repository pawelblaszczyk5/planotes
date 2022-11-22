import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps } from '@zag-js/solid';
import { createMemo, createUniqueId, type JSXElement, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { A, useNavigate } from 'solid-start';

type DialogProps = {
	children: JSXElement;
	description: JSXElement;
	title: JSXElement;
};

type RouteDialogProps = DialogProps & {
	exitRedirect?: string;
};

export const RouteDialog = (props: RouteDialogProps) => {
	const navigate = useNavigate();

	const [state, send] = useMachine(
		dialog.machine({
			// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
			closeOnEsc: Boolean(props.exitRedirect),
			// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
			closeOnOutsideClick: Boolean(props.exitRedirect),
			defaultOpen: true,
			id: createUniqueId(),
			onClose: () => navigate(props.exitRedirect!),
		}),
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	return (
		<Portal>
			<div class="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" {...api().backdropProps} />
			<div
				{...api().underlayProps}
				class="fixed top-1/2 left-1/2 z-20 max-h-[calc(100%-4rem)] w-[calc(100%-4rem)] max-w-2xl translate-y--1/2 translate-x--1/2"
			>
				<div
					{...api().contentProps}
					class="bg-primary ring-primary rounded-md p-8 shadow-md shadow-black/50 dark:shadow-black/90"
				>
					<h3 class="b-b-1 b-primary mb-4 pb-2 text-3xl font-medium" {...api().titleProps}>
						{props.title}
					</h3>
					<p class="text-secondary mb-6 text-sm" {...api().descriptionProps}>
						{props.description}
					</p>
					{props.children}
					<Show when={props.exitRedirect}>
						<A
							href={props.exitRedirect!}
							class="ring-primary fixed top-2 right-2 grid h-10 w-10 place-items-center rounded"
						>
							<i class="i-lucide-x" aria-label="Close" />
						</A>
					</Show>
				</div>
			</div>
		</Portal>
	);
};
