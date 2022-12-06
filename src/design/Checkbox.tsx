import { Presence, Motion } from '@motionone/solid';
import * as checkbox from '@zag-js/checkbox';
import { normalizeProps, useMachine } from '@zag-js/solid';
import clsx from 'clsx';
import { type JSXElement, createEffect, createMemo, createUniqueId, mergeProps, untrack, Show } from 'solid-js';
import { type DefaultProps } from '~/utils/types';

type CheckboxProps = {
	checked?: boolean;
	children: JSXElement;
	class?: string;
	name: string;
};

const DEFAULT_CHECKBOX_PROPS = {
	checked: false,
} as const satisfies DefaultProps<CheckboxProps>;

export const Checkbox = (props: CheckboxProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_CHECKBOX_PROPS, props);
	// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
	const [state, send] = useMachine(checkbox.machine({ id: createUniqueId(), name: propsWithDefaults.name }));

	const api = createMemo(() => checkbox.connect(state, send, normalizeProps));

	createEffect(() => {
		untrack(api).setChecked(propsWithDefaults.checked);
	});

	return (
		<label
			class={clsx(
				'text-secondary [&[data-checked]]:text-primary flex items-center text-sm outline-offset-2 transition-colors',
				propsWithDefaults.class,
			)}
			{...api().rootProps}
		>
			<div
				class="b-primary b-2 [&[data-focus]]:ring-primary-force mr-2 grid h-6 w-6 place-items-center rounded-sm outline-offset-2"
				{...api().controlProps}
			>
				<Presence>
					<Show when={api().isChecked}>
						<Motion.div
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.6 }}
							transition={{ duration: 0.2 }}
							class="bg-accent i-lucide-check h-4 w-4"
						/>
					</Show>
				</Presence>
			</div>
			<span {...api().labelProps}>{propsWithDefaults.children}</span>
			<input {...api().inputProps} />
		</label>
	);
};
