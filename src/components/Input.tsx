import clsx from 'clsx';
import { type JSXElement, createUniqueId, Show, mergeProps } from 'solid-js';

type InputProps = {
	autocomplete?:
		| 'off'
		| 'autocomplete'
		| 'off'
		| 'on'
		| 'name'
		| 'name'
		| 'autocomplete'
		| 'honorific-prefix'
		| 'given-name'
		| 'additional-name'
		| 'family-name'
		| 'honorific-suffix'
		| 'nickname'
		| 'email'
		| 'username'
		| 'new-password'
		| 'current-password'
		| 'one-time-code'
		| 'organization-title'
		| 'organization'
		| 'street-address'
		| 'address-line1'
		| 'address-line2'
		| 'address-line3'
		| 'street-address'
		| 'address-level4'
		| 'address-level3'
		| 'address-level2'
		| 'address-level1'
		| 'country'
		| 'country-name'
		| 'postal-code'
		| 'cc-name'
		| 'cc-given-name'
		| 'cc-additional-name'
		| 'cc-family-name'
		| 'cc-number'
		| 'cc-exp'
		| 'cc-exp-month'
		| 'cc-exp-year'
		| 'cc-csc'
		| 'cc-type'
		| 'transaction-currency'
		| 'transaction-amount'
		| 'transaction-currency'
		| 'language'
		| 'bday'
		| 'bday-day'
		| 'bday-month'
		| 'bday-year'
		| 'sex'
		| 'tel'
		| 'tel-country-code'
		| 'tel-national'
		| 'tel-area-code'
		| 'tel-local'
		| 'tel-local-prefix'
		| 'tel-local-suffix'
		| 'tel-extension'
		| 'impp'
		| 'url'
		| 'photo';
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
