import { type Item } from '@prisma/client';
import { For } from 'solid-js';
import { ButtonLink } from '~/shared/components/Button';

type ItemListProps = {
	currentPage: number;
	hasNextPage: boolean;
	items: Array<Item>;
};

export const ItemList = (props: ItemListProps) => {
	return (
		<>
			<div class="my-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all items that you previously added and buy them! You can also add a new item by using the
					button next to this text.
				</p>
				<ButtonLink href="/app/shop/item/new">Add</ButtonLink>
			</div>
			<ul role="list">
				<For
					fallback={
						<h2 class="text-secondary text-center text-sm">
							You don't have any items yet. Go add your first one and start earning prizes for your hard work!
						</h2>
					}
					each={props.items}
				>
					{item => <li role="listitem">{item.name}</li>}
				</For>
			</ul>
		</>
	);
};
