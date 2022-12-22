// @refresh reload
import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/solid';
import clsx from 'clsx';
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
	const [state, send] = useMachine(
		menu.machine({
			id: createUniqueId(),
			positioning: {
				flip: true,
				placement: 'bottom-end',
			},
		}),
	);

	const api = createMemo(() => menu.connect(state, send, normalizeProps));

	return (
		<div>
			<button
				class="ring-primary b-2 b-accent flex items-center rounded py-2 px-6 text-sm outline-offset-2"
				{...api().triggerProps}
			>
				{propsWithDefaults.triggerContent}
				<i class={clsx('ml-1 text-base', api().isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down')} />
			</button>
			<div class="z-10" {...api().positionerProps}>
				<div
					class="bg-primary [&_*:not(:last-child)]:b-b-1 ring-primary max-h-[calc(41px*6)] flex-col overflow-y-auto text-sm shadow shadow-md shadow-black/50 dark:shadow-black/90"
					{...api().contentProps}
				>
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

	return (
		<button
			class="[&[data-focus]]:text-accent b-primary block w-48 truncate py-2 px-4 text-center"
			{...api().getItemProps({ id: props.id })}
		>
			{props.children}
		</button>
	);
};

type LinkItemProps = SharedItemProps & {
	href: string;
};

const LinkItem = (props: LinkItemProps) => {
	const api = useApi();

	return (
		<A
			class="[&[data-focus]]:text-accent b-primary block w-48 truncate py-2 px-4 text-center"
			href={props.href}
			{...api().getItemProps({ id: props.id })}
		>
			{props.children}
		</A>
	);
};

export const Menu = { ButtonItem, LinkItem, Root };
