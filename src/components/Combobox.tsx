import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/solid';
import clsx from 'clsx';
import { type JSXElement, createMemo, createUniqueId, For, createSignal, mergeProps } from 'solid-js';
import { type DefaultProps } from '~/utils/types';

type Option = {
	label: string;
	value: string;
};

type ComboboxProps = {
	children: JSXElement;
	class?: string;
	error?: string | undefined;
	name: string;
	options: Array<Option>;
	value?: Option | null;
};

const DEFAULT_COMBOBOX_PROPS = {
	value: null,
} as const satisfies DefaultProps<ComboboxProps>;

export const Combobox = (props: ComboboxProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_COMBOBOX_PROPS, props);
	const [optionsToDisplay, setOptionsToDisplay] = createSignal<ComboboxProps['options']>([]);

	const [state, send] = useMachine(
		combobox.machine({
			allowCustomValue: false,
			id: createUniqueId(),
			inputBehavior: 'autohighlight',
			loop: true,
			onClose: () => {
				const inputValue = state.context.inputValue;

				if (!inputValue) return;

				const isInputValueValid = optionsToDisplay().some(option => option.label === inputValue);

				if (isInputValueValid) return;

				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				api().setInputValue(optionsToDisplay().find(option => option.value === api().selectedValue)?.label ?? '');
			},
			onInputChange: ({ value }) => {
				const filtered = propsWithDefaults.options.filter(option =>
					option.label.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
				);

				setOptionsToDisplay(filtered.length > 0 ? filtered : propsWithDefaults.options);
			},
			onOpen: () => setOptionsToDisplay(propsWithDefaults.options),
			openOnClick: true,
			positioning: {
				flip: true,
			},
			selectionData: propsWithDefaults.value,
		}),
	);

	const api = createMemo(() => combobox.connect(state, send, normalizeProps));

	const hasError = () => Boolean(propsWithDefaults.error);

	return (
		<>
			<div class={clsx('flex flex-col', propsWithDefaults.class)} {...api().rootProps}>
				<label class="text-secondary pb-1 text-sm" {...api().labelProps}>
					{propsWithDefaults.children}
				</label>
				<div
					class={clsx(
						'b-2 text-primary focus-within:ring-primary-force flex w-full items-center rounded-sm bg-transparent py-2 px-4 pr-0 text-base outline-offset-2',
						hasError() ? 'b-destructive' : 'b-primary',
					)}
					{...api().controlProps}
				>
					<input class="h-full flex-1 bg-transparent outline-0" {...api().inputProps} />
					<button class="h-full w-10" {...api().toggleButtonProps}>
						▼
					</button>
				</div>
				<input type="hidden" name={propsWithDefaults.name} readonly value={api().selectedValue ?? ''} />
			</div>
			<div {...api().positionerProps}>
				{optionsToDisplay().length > 0 && (
					<ul {...api().listboxProps}>
						<For each={optionsToDisplay()}>
							{(item, index) => (
								<li
									class="combobox__option"
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
				)}
			</div>
		</>
	);
};
