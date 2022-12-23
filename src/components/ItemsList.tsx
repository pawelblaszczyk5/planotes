import { type Item } from '@prisma/client';
import clsx from 'clsx';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { ButtonLink } from '~/components/Button';
import { Menu } from '~/components/Menu';
import { Pagination } from '~/components/Pagination';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';
import { type FormErrors, convertFormDataIntoObject, createFormFieldsErrors } from '~/utils/form';
import { gentleScroll } from '~/utils/gentleScroll';
import { requireUserId } from '~/utils/session';
import { getCurrentEpochSeconds } from '~/utils/time';

type ItemsListProps = {
	currentPage: number;
	hasNextPage: boolean;
	items: Array<Item>;
};

const FORM_ERRORS = {
	ITEM_NOT_FOUND: "Can't find a item with a given id",
	ITEM_TOO_EXPENSIVE: "You can't afford this item",
} as const satisfies FormErrors;

export const ItemsList = (props: ItemsListProps) => {
	const [buyItemErorElement, setBuyItemErorElement] = createSignal<HTMLParagraphElement>();
	const [deleteItemErrorElement, setDeleteItemErorElement] = createSignal<HTMLParagraphElement>();
	const [buyItem, buyItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const buyItemSchema = z.object({
			id: z.string().cuid(),
		});
		const userId = await requireUserId(request);

		const parsedBuyItemPayload = buyItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedBuyItemPayload.success) throw new FormError(FORM_ERRORS.ITEM_NOT_FOUND);

		const [itemToBuy, user] = await Promise.all([
			db.item.findUnique({
				select: { price: true, type: true, userId: true },
				where: { id: parsedBuyItemPayload.data.id },
			}),
			db.user.findFirstOrThrow({ select: { balance: true }, where: { id: userId } }),
		]);

		if (!itemToBuy || itemToBuy.userId !== userId) throw new FormError(FORM_ERRORS.ITEM_NOT_FOUND);

		if (itemToBuy.price > user?.balance) throw new FormError(FORM_ERRORS.ITEM_TOO_EXPENSIVE);

		const promises: Array<Promise<any>> = [
			db.user.update({ data: { balance: user.balance - itemToBuy.price }, where: { id: userId } }),
			db.balanceEntry.create({
				data: {
					change: -itemToBuy.price,
					createdAt: getCurrentEpochSeconds(),
					entity: 'ITEM',
					itemId: parsedBuyItemPayload.data.id,
					userId,
				},
			}),
		];

		if (itemToBuy.type !== 'RECURRING')
			promises.push(db.item.update({ data: { status: 'UNAVAILABLE' }, where: { id: parsedBuyItemPayload.data.id } }));

		await Promise.all(promises);

		return redirect(request.headers.get('referer') ?? REDIRECTS.SHOP);
	});

	const [deleteItem, deleteItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const deleteItemSchema = z.object({
			id: z.string().cuid(),
		});
		const userId = await requireUserId(request);

		const parsedDeleteItemPayload = deleteItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedDeleteItemPayload.success) throw new FormError(FORM_ERRORS.ITEM_NOT_FOUND);

		const item = await db.item.findUnique({
			select: { userId: true },
			where: { id: parsedDeleteItemPayload.data.id },
		});

		if (item?.userId !== userId) throw new FormError(FORM_ERRORS.ITEM_NOT_FOUND);

		await db.item.update({
			data: { status: 'ARCHIVED' },
			where: { id: parsedDeleteItemPayload.data.id },
		});

		return redirect(request.headers.get('referer') ?? REDIRECTS.SHOP);
	});

	const buyItemErrors = createFormFieldsErrors(() => buyItem.error);
	const deleteItemErrors = createFormFieldsErrors(() => deleteItem.error);

	createEffect(() => {
		const error = buyItemErorElement();

		if (!error || !Object.values(buyItemErrors()).length) return;

		gentleScroll(error);
	});

	createEffect(() => {
		const error = deleteItemErrorElement();

		if (!error || !Object.values(deleteItemErrors()).length) return;

		gentleScroll(error);
	});

	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all items that you previously added and buy them! You can also add a new item by using the
					button next to this text.
				</p>
				<ButtonLink href="/app/shop/item/new">Add</ButtonLink>
			</div>
			<Show when={buyItemErrors()['other']}>
				<p ref={setBuyItemErorElement} class="text-destructive mb-6 text-sm">
					{buyItemErrors()['other']}
				</p>
			</Show>
			<Show when={deleteItemErrors()['other']}>
				<p ref={setDeleteItemErorElement} class="text-destructive mb-6 text-sm">
					{deleteItemErrors()['other']}
				</p>
			</Show>
			<p class="text-destructive text-sm" />
			<ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
				<For
					fallback={
						<h2 class="text-secondary col-span-full text-center text-sm">
							You don't have any items yet. Go add your first one and start earning prizes for your hard work!
						</h2>
					}
					each={props.items}
				>
					{item => (
						<li
							role="listitem"
							class="bg-secondary flex flex-col justify-between gap-9 rounded p-6 shadow shadow-black/50 dark:shadow-black/90"
						>
							<div class="flex justify-between gap-6">
								<div class="flex-1">
									<h3 class="font-500 mb-3 w-full text-lg">{item.name}</h3>
									<p class="text-secondary mb-1 flex items-center gap-1 text-sm">
										Price:{' '}
										<span class="text-accent font-500 contents">
											{item.price} <i class="i-lucide-coins" aria-hidden />
										</span>
									</p>
									<p class="text-secondary flex items-center text-sm">
										Recurring:{' '}
										<span class="text-accent font-500 contents">
											{item.type === 'RECURRING' ? 'Yes' : 'No'}
											<i
												class={clsx(
													'ml-1',
													item.type === 'RECURRING' ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle',
												)}
												aria-hidden
											/>
										</span>
									</p>
								</div>
								<div class="flex h-20 w-20 items-center justify-center">
									<Show when={item.iconUrl} fallback={<i class="i-lucide-box text-7xl" aria-hidden />}>
										<img class="max-h-full max-w-full object-cover" src={item.iconUrl!} alt="" />
									</Show>
								</div>
							</div>
							<Menu.Root class="md:self-end" triggerContent="Actions">
								<Menu.LinkItem id="edit" href={`/app/shop/item/${item.id}`}>
									<TextAlignedIcon icon="i-lucide-edit">Edit</TextAlignedIcon>
								</Menu.LinkItem>
								<buyItemTrigger.Form>
									<Menu.ButtonItem name="id" value={item.id} id="buy">
										<TextAlignedIcon icon="i-lucide-shopping-cart">Buy</TextAlignedIcon>
									</Menu.ButtonItem>
								</buyItemTrigger.Form>
								<deleteItemTrigger.Form>
									<Menu.ButtonItem name="id" value={item.id} id="delete">
										<TextAlignedIcon icon="i-lucide-trash-2">Delete</TextAlignedIcon>
									</Menu.ButtonItem>
								</deleteItemTrigger.Form>
							</Menu.Root>
						</li>
					)}
				</For>
			</ul>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<Pagination currentPage={props.currentPage} hasNextPage={props.hasNextPage} module="shop" class="my-6" />
			</Show>
		</>
	);
};
