import * as radio from '@zag-js/radio';
import { normalizeProps, useMachine } from '@zag-js/solid';
import {
	type Accessor,
	type JSXElement,
	createUniqueId,
	createMemo,
	createContext,
	useContext,
	createEffect,
} from 'solid-js';

// FIXME: Use standard children JSX notation after https://github.com/solidjs/solid/issues/1345

type Api = Accessor<ReturnType<typeof radio.connect>>;

const RadioGroupContext = createContext<Api>();

const useApi = () => {
	const api = useContext(RadioGroupContext);

	if (!api) throw new Error('RadioGroup.Item and RadioGroup.Label should be used within RadioGroup.Root');

	return api;
};

type RootProps = { children: JSXElement; name: string; value?: string };

const Root = (props: RootProps) => {
	const radioGroupId = createUniqueId();
	// eslint-disable-next-line solid/reactivity -- there is no way to set name programatically after init
	const [state, send] = useMachine(radio.machine({ id: radioGroupId, name: props.name }));

	const api = createMemo(() => radio.connect(state, send, normalizeProps));

	createEffect(() => {
		if (typeof props.value === 'string') api().setValue(props.value);
	});

	return (
		<RadioGroupContext.Provider value={api}>
			<div {...api().rootProps} children={props.children} />
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
			{...api().getItemProps({ value: props.value })}
			children={
				<>
					<span {...api().getItemLabelProps({ value: props.value })}>{props.children}</span>
					<input {...api().getItemInputProps({ value: props.value })} />
					<div {...api().getItemControlProps({ value: props.value })} />
				</>
			}
		/>
	);
};

type LabelProps = {
	children: JSXElement;
};

const Label = (props: LabelProps) => {
	const api = useApi();

	return <h3 {...api().labelProps} children={props.children} />;
};

export const RadioGroup = { Item, Label, Root };
