import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/solid';
import clsx from 'clsx';
import {
	type JSXElement,
	createMemo,
	createUniqueId,
	For,
	createSignal,
	mergeProps,
	Show,
	createEffect,
	untrack,
} from 'solid-js';
import { type DefaultProps } from '~/utils/types';

type Option = {
	label: string;
	value: string;
};

export type { Option as ComboboxOption };

type ComboboxProps = {
	children: JSXElement;
	class?: string;
	error?: string | undefined;
	maxOptions?: number;
	name: string;
	options: Array<Option>;
	value?: Option | null;
};

const DEFAULT_COMBOBOX_PROPS = {
	maxOptions: Number.POSITIVE_INFINITY,
	value: null,
} as const satisfies DefaultProps<ComboboxProps>;

export const Combobox = (props: ComboboxProps) => {
	const id = createUniqueId();
	const propsWithDefaults = mergeProps(DEFAULT_COMBOBOX_PROPS, props);
	const [optionsToDisplay, setOptionsToDisplay] = createSignal<ComboboxProps['options']>([]);

	const [state, send] = useMachine(
		combobox.machine({
			allowCustomValue: false,
			id,
			inputBehavior: 'autohighlight',
			loop: true,
			onClose: () => {
				setTimeout(() => {
					const inputValue = state.context.inputValue;

					if (!inputValue) {
						api().setValue('');
						return;
					}

					const respectiveOption = propsWithDefaults.options.find(option => option.label === inputValue);

					if (respectiveOption) {
						api().setValue(respectiveOption);
						return;
					}

					api().setInputValue(
						propsWithDefaults.options.find(option => option.value === api().selectedValue)?.label ?? '',
					);
				});
			},
			onInputChange: ({ value }) => {
				const transformedValue = value.toLocaleLowerCase().trim();
				const filtered = propsWithDefaults.options.filter(option =>
					option.label.toLocaleLowerCase().trim().includes(transformedValue),
				);

				setOptionsToDisplay(
					(filtered.length > 0 ? filtered : propsWithDefaults.options).slice(0, propsWithDefaults.maxOptions),
				);
			},
			onOpen: () => setOptionsToDisplay(propsWithDefaults.options.slice(0, propsWithDefaults.maxOptions)),
			openOnClick: true,
			positioning: {
				flip: true,
			},
			// eslint-disable-next-line solid/reactivity -- it's synced via createEffetc below
			selectionData: propsWithDefaults.value,
			translations: {
				countAnnouncement: count => `Found ${count} options`,
				toggleButtonLabel: 'Show available options',
			},
		}),
	);

	const api = createMemo(() => combobox.connect(state, send, normalizeProps));

	createEffect(() => {
		untrack(api).setValue(propsWithDefaults.value ?? '');
	});

	const hasError = () => Boolean(propsWithDefaults.error);

	return (
		<>
			<div class={clsx('flex flex-col', propsWithDefaults.class)} {...api().rootProps}>
				<label class="text-secondary pb-1 text-sm" {...api().labelProps}>
					{propsWithDefaults.children}
				</label>
				<div
					class={clsx(
						'b-2 text-primary [&[data-focus]]:ring-primary-force flex w-full items-center rounded-sm bg-transparent py-2 px-4 pr-0 text-base outline-offset-2',
						hasError() ? 'b-destructive' : 'b-primary',
					)}
					{...api().controlProps}
				>
					<input
						aria-invalid={hasError()}
						aria-describedby={hasError() ? `${id}-error` : ''}
						class="h-full flex-1 bg-transparent outline-0"
						{...api().inputProps}
					/>
					<button class="h-full w-10" {...api().toggleButtonProps}>
						<i class="i-lucide-chevron-down" aria-hidden />
					</button>
				</div>
				<Show when={hasError()}>
					<span class="text-destructive pt-1 text-sm" id={`${id}-error`} role="alert">
						{propsWithDefaults.error}
					</span>
				</Show>
				<input type="hidden" name={propsWithDefaults.name} readonly value={api().selectedValue ?? ''} />
			</div>
			<div {...api().positionerProps}>
				<Show when={optionsToDisplay().length}>
					<ul
						class="bg-primary max-h-[calc(41px*6)] overflow-y-auto shadow-md shadow-black/50 dark:shadow-black/90"
						{...api().listboxProps}
					>
						<For each={optionsToDisplay()}>
							{(item, index) => (
								<li
									class="[&[data-highlighted]]:text-accent not-last:b-b-1 b-primary py-2 px-4"
									{...api().getOptionProps({
										disabled: false,
										index: index(),
										label: item.label,
										value: item.value,
									})}
								>
									{item.label}
								</li>
							)}
						</For>
					</ul>
				</Show>
			</div>
		</>
	);
};
