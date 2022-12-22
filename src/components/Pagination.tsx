import clsx from 'clsx';
import { mergeProps, Show } from 'solid-js';
import { LinkWithIcon } from '~/components/Link';
import { type Module, type DefaultProps } from '~/types';

type PaginationProps = {
	class?: string;
	currentPage: number;
	hasNextPage: boolean;
	module: Module;
};

const DEFAULT_PAGINATION_PROPS = {
	class: '',
} as const satisfies DefaultProps<PaginationProps>;

export const Pagination = (props: PaginationProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_PAGINATION_PROPS, props);

	return (
		<div class={clsx('flex', propsWithDefaults.class)}>
			<Show when={props.currentPage !== 1}>
				<LinkWithIcon
					class="mr-auto"
					icon="i-lucide-arrow-big-left"
					href={
						propsWithDefaults.currentPage === 2
							? `/app/${propsWithDefaults.module}`
							: `/app/${propsWithDefaults.module}/page/${props.currentPage - 1}`
					}
					end
				>
					Previous
				</LinkWithIcon>
			</Show>
			<Show when={props.hasNextPage}>
				<LinkWithIcon
					class="ml-auto"
					icon="i-lucide-arrow-big-right"
					href={`/app/${propsWithDefaults.module}/page/${propsWithDefaults.currentPage + 1}`}
					end
				>
					Next
				</LinkWithIcon>
			</Show>
		</div>
	);
};
