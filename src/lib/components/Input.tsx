import { type JSXElement, createUniqueId, Show } from 'solid-js';

type InputProps = {
	autocomplete?: 'email' | 'username';
	children: JSXElement;
	error?: JSXElement;
	name?: string;
	type?: 'email' | 'text';
	value?: string;
};

export const Input = (props: InputProps) => {
	const id = createUniqueId();

	const hasError = () => Boolean(props.error);

	return (
		<div class="flex flex-col">
			<label class="text-secondary pb-1 text-sm" for={`${id}-input`}>
				{props.children}
			</label>
			<input
				class="b-2 text-primary ring-primary rounded-sm bg-transparent py-2 px-4 text-base outline-offset-2"
				classList={{ 'b-destructive': hasError(), 'b-primary': !hasError() }}
				type={props.type ?? 'text'}
				id={`${id}-input`}
				name={props.name ?? ''}
				value={props.value ?? ''}
				aria-invalid={hasError()}
				aria-describedby={hasError() ? `${id}-error` : ''}
				autocomplete={props.autocomplete ?? 'off'}
			/>
			<Show when={hasError()}>
				<span class="text-destructive pt-1 text-sm" id={`${id}-error`} role="alert">
					{props.error}
				</span>
			</Show>
		</div>
	);
};
