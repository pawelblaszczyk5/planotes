import * as numberInput from '@zag-js/number-input';
import { normalizeProps, useMachine } from '@zag-js/solid';
import clsx from 'clsx';
import { type JSXElement, createUniqueId, Show, mergeProps, createMemo, createEffect, untrack } from 'solid-js';
import { type DefaultProps } from '~/utils/types';

type NumberInputProps = {
	children: JSXElement;
	class?: string;
	error?: string | undefined;
	name: string;
	value?: string;
};

const DEFAULT_NUMBER_INPUT_PROPS = {
	value: '',
} as const satisfies DefaultProps<NumberInputProps>;

export const NumberInput = (props: NumberInputProps) => {
	const id = createUniqueId();
	const propsWithDefaults = mergeProps(DEFAULT_NUMBER_INPUT_PROPS, props);
	const [state, send] = useMachine(
		numberInput.machine({
			id,
			maxFractionDigits: 0,
			// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
			name: propsWithDefaults.name,
			translations: { decrementLabel: 'Decrease value', incrementLabel: 'Increase value' },
			value: '',
		}),
	);

	const api = createMemo(() => numberInput.connect(state, send, normalizeProps));

	const hasError = () => Boolean(propsWithDefaults.error);

	createEffect(() => {
		untrack(api).setValue(propsWithDefaults.value);
	});

	return (
		<div class={clsx('flex flex-col', propsWithDefaults.class)} {...api().rootProps}>
			<label class="text-secondary pb-1 text-sm" {...api().labelProps}>
				{propsWithDefaults.children}
			</label>
			<div
				class={clsx(
					'b-2 text-primary ring-primary focus-within:ring-primary-force flex rounded-sm bg-transparent text-base outline-offset-2',
					hasError() ? 'b-destructive' : 'b-primary',
				)}
			>
				<button class="text-accent w-10 text-xl" {...api().decrementTriggerProps}>
					<i class="i-lucide-minus" />
				</button>
				<input
					class="flex-1 bg-transparent py-2 outline-0"
					{...api().inputProps}
					aria-invalid={hasError()}
					aria-describedby={hasError() ? `${id}-error` : ''}
				/>
				<button class="text-accent w-10 text-xl" {...api().incrementTriggerProps}>
					<i class="i-lucide-plus" />
				</button>
			</div>
			<Show when={hasError()}>
				<span class="text-destructive pt-1 text-sm" id={`${id}-error`} role="alert">
					{propsWithDefaults.error}
				</span>
			</Show>
		</div>
	);
};
