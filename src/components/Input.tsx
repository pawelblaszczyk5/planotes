import clsx from 'clsx';
import { type JSXElement, createUniqueId, Show, mergeProps } from 'solid-js';

type InputProps = {
	autocomplete?: 'email' | 'off' | 'username';
	children: JSXElement;
	class?: string;
	error?: JSXElement;
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
