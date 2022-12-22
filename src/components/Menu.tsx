// @refresh reload
import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/solid';
import {
	type Accessor,
	type JSXElement,
	createContext,
	createMemo,
	createUniqueId,
	useContext,
	mergeProps,
} from 'solid-js';
import { A } from 'solid-start';
import { type DefaultProps } from '~/types';

type Api = Accessor<ReturnType<typeof menu.connect>>;

const MenuContext = createContext<Api>();

const useApi = () => {
	const api = useContext(MenuContext);

	if (!api) throw new Error('Menu.ButtonItem and Menu.LinkItem should be used within Menu.Root');

	return api;
};

type RootProps = {
	children: JSXElement;
	class?: string;
	triggerContent: JSXElement;
};

const DEFAULT_ROOT_PROPS = {
	class: '',
} as const satisfies DefaultProps<RootProps>;

const Root = (props: RootProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_ROOT_PROPS, props);
	const [state, send] = useMachine(menu.machine({ id: createUniqueId() }));

	const api = createMemo(() => menu.connect(state, send, normalizeProps));

	return (
		<div>
			<button {...api().triggerProps}>{propsWithDefaults.triggerContent}</button>
			<div {...api().positionerProps}>
				<div {...api().contentProps}>
					<MenuContext.Provider value={api}>{propsWithDefaults.children}</MenuContext.Provider>
				</div>
			</div>
		</div>
	);
};

type SharedItemProps = {
	children: JSXElement;
	id: string;
};

type ButtonItemProps = SharedItemProps;

const ButtonItem = (props: ButtonItemProps) => {
	const api = useApi();

	return <button {...api().getItemProps({ id: props.id })}>{props.children}</button>;
};

type LinkItemProps = SharedItemProps & {
	href: string;
};

const LinkItem = (props: LinkItemProps) => {
	const api = useApi();

	return (
		<A href={props.href} {...api().getItemProps({ id: props.id })}>
			{props.children}
		</A>
	);
};

export const Menu = { ButtonItem, LinkItem, Root };
