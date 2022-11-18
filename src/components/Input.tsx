import clsx from 'clsx';
import { type JSXElement, createUniqueId, Show, mergeProps } from 'solid-js';

type InputProps = {
	autocomplete?:
		| 'additional-name'
		| 'address-level1'
		| 'address-level2'
		| 'address-level3'
		| 'address-level4'
		| 'address-line1'
		| 'address-line2'
		| 'address-line3'
		| 'autocomplete'
		| 'autocomplete'
		| 'bday-day'
		| 'bday-month'
		| 'bday-year'
		| 'bday'
		| 'cc-additional-name'
		| 'cc-csc'
		| 'cc-exp-month'
		| 'cc-exp-year'
		| 'cc-exp'
		| 'cc-family-name'
		| 'cc-given-name'
		| 'cc-name'
		| 'cc-number'
		| 'cc-type'
		| 'country-name'
		| 'country'
		| 'current-password'
		| 'email'
		| 'family-name'
		| 'given-name'
		| 'honorific-prefix'
		| 'honorific-suffix'
		| 'impp'
		| 'language'
		| 'name'
		| 'name'
		| 'new-password'
		| 'nickname'
		| 'off'
		| 'off'
		| 'on'
		| 'one-time-code'
		| 'organization-title'
		| 'organization'
		| 'photo'
		| 'postal-code'
		| 'sex'
		| 'street-address'
		| 'street-address'
		| 'tel-area-code'
		| 'tel-country-code'
		| 'tel-extension'
		| 'tel-local-prefix'
		| 'tel-local-suffix'
		| 'tel-local'
		| 'tel-national'
		| 'tel'
		| 'transaction-amount'
		| 'transaction-currency'
		| 'transaction-currency'
		| 'url'
		| 'username';
	children: JSXElement;
	class?: string;
	error?: string | undefined;
	name: string;
	type?: 'email' | 'text';
	value?: string;
};

const DEFAULT_INPUT_PROPS = {
	autocomplete: 'off',
	class: '',
	type: 'text',
	value: '',
} as const;

export const Input = (props: InputProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_INPUT_PROPS, props);
	const id = createUniqueId();

	const hasError = () => Boolean(propsWithDefaults.error);

	return (
		<div class={clsx('flex flex-col', propsWithDefaults.class)}>
			<label class="text-secondary pb-1 text-sm" for={`${id}-input`}>
				{propsWithDefaults.children}
			</label>
			<input
				class={clsx(
					'b-2 text-primary ring-primary rounded-sm bg-transparent py-2 px-4 text-base outline-offset-2',
					hasError() ? 'b-destructive' : 'b-primary',
				)}
				type={propsWithDefaults.type}
				id={`${id}-input`}
				name={propsWithDefaults.name}
				value={propsWithDefaults.value}
				aria-invalid={hasError()}
				aria-describedby={hasError() ? `${id}-error` : ''}
				autocomplete={propsWithDefaults.autocomplete}
			/>
			<Show when={hasError()}>
				<span class="text-destructive pt-1 text-sm" id={`${id}-error`} role="alert">
					{propsWithDefaults.error}
				</span>
			</Show>
		</div>
	);
};
