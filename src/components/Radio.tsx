// @refresh reload
import { Motion, Presence } from '@motionone/solid';
import * as radio from '@zag-js/radio-group';
import { normalizeProps, useMachine } from '@zag-js/solid';
import {
	type Accessor,
	type JSXElement,
	createUniqueId,
	createMemo,
	createContext,
	useContext,
	Show,
	createEffect,
	untrack,
	mergeProps,
} from 'solid-js';
import { type DefaultProps } from '~/types';

type Api = Accessor<ReturnType<typeof radio.connect>>;

const RadioGroupContext = createContext<Api>();

const useApi = () => {
	const api = useContext(RadioGroupContext);

	if (!api) throw new Error('RadioGroup.Item and RadioGroup.Label should be used within RadioGroup.Root');

	return api;
};

type RootProps = { children: JSXElement; class?: string; name: string; value?: string };

const DEFAULT_ROOT_PROPS = {
	value: '',
} as const satisfies DefaultProps<RootProps>;

const Root = (props: RootProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_ROOT_PROPS, props);
	const [state, send] = useMachine(
		// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
		radio.machine({ id: createUniqueId(), name: propsWithDefaults.name, value: propsWithDefaults.value }),
	);

	const api = createMemo(() => radio.connect(state, send, normalizeProps));

	createEffect(() => {
		untrack(api).setValue(propsWithDefaults.value);
	});

	return (
		<RadioGroupContext.Provider value={api}>
			<div class={propsWithDefaults.class} {...api().rootProps}>
				{propsWithDefaults.children}
			</div>
		</RadioGroupContext.Provider>
	);
};

type ItemProps = {
	children: JSXElement;
	value: string;
};

const Item = (props: ItemProps) => {
	const api = useApi();

	return (
		<label
			class="text-secondary [&[data-checked]]:text-primary flex items-center text-sm outline-offset-2 transition-colors"
			{...api().getRadioProps({ value: props.value })}
		>
			<div
				class="b-primary b-2 [&[data-focus]]:ring-primary-force mr-2 grid h-6 w-6 place-items-center rounded-full outline-offset-2"
				{...api().getRadioControlProps({ value: props.value })}
			>
				<Presence>
					<Show when={api().value === props.value}>
						<Motion.div
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.6 }}
							transition={{ duration: 0.2 }}
							class="bg-accent h-3 w-3 rounded-full"
						/>
					</Show>
				</Presence>
			</div>
			<span {...api().getRadioLabelProps({ value: props.value })}>{props.children}</span>
			<input {...api().getRadioInputProps({ value: props.value })} />
		</label>
	);
};

type LabelProps = {
	children: JSXElement;
};

const Label = (props: LabelProps) => {
	const api = useApi();

	return (
		<h3 {...api().labelProps} class="text-secondary pb-1 text-sm">
			{props.children}
		</h3>
	);
};

export const RadioGroup = { Item, Label, Root };
