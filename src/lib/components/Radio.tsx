// TODO:  check if it can be solved other way
// @refresh reload
import { Motion, Presence } from '@motionone/solid';
import * as radio from '@zag-js/radio';
import { normalizeProps, useMachine } from '@zag-js/solid';
import { type Accessor, type JSXElement, createUniqueId, createMemo, createContext, useContext, Show } from 'solid-js';

type Api = Accessor<ReturnType<typeof radio.connect>>;

const RadioGroupContext = createContext<Api>();

const useApi = () => {
	const api = useContext(RadioGroupContext);

	if (!api) throw new Error('RadioGroup.Item and RadioGroup.Label should be used within RadioGroup.Root');

	return api;
};

type RootProps = { children: JSXElement; name: string; defaultValue?: string };

const Root = (props: RootProps) => {
	const radioGroupId = createUniqueId();
	// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
	const [state, send] = useMachine(
		radio.machine({ id: radioGroupId, name: props.name, value: props.defaultValue ?? null }),
	);

	const api = createMemo(() => radio.connect(state, send, normalizeProps));

	return (
		<RadioGroupContext.Provider value={api}>
			<div class="flex flex-col items-start gap-2" {...api().rootProps}>
				{props.children}
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
			class="text-secondary [&[data-checked]]:text-primary [&[data-focus]]:ring-primary-force flex items-center outline-offset-2"
			{...api().getItemProps({ value: props.value })}
		>
			<div
				class="b-primary b-2 mr-2 grid h-6 w-6 place-items-center rounded-full"
				{...api().getItemControlProps({ value: props.value })}
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
			<span class="text-sm" {...api().getItemLabelProps({ value: props.value })}>
				{props.children}
			</span>
			<input {...api().getItemInputProps({ value: props.value })} />
		</label>
	);
};

type LabelProps = {
	children: JSXElement;
};

const Label = (props: LabelProps) => {
	const api = useApi();

	return <h3 {...api().labelProps}>{props.children}</h3>;
};

export const RadioGroup = { Item, Label, Root };
