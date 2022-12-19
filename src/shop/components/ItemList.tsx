import { type Item } from '@prisma/client';
import clsx from 'clsx';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { FormError } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { Button, ButtonLink } from '~/shared/components/Button';
import { LinkWithIcon } from '~/shared/components/Link';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import { type FormErrors, convertFormDataIntoObject, createFormFieldsErrors } from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';

type ItemListProps = {
	currentPage: number;
	hasNextPage: boolean;
	items: Array<Item>;
};

const buyItemSchema = z.object({
	id: z.string().cuid(),
});

const FORM_ERRORS = {
	ID_INVALID: 'Invalid item ID, there is something off',
	ITEM_NOT_FOUND: "Can't find a item with a given id",
	ITEM_TOO_EXPENSIVE: "You can't afford this item",
} as const satisfies FormErrors;

export const ItemList = (props: ItemListProps) => {
	const [errorElement, setErrorElement] = createSignal<HTMLParagraphElement | null>(null);
	const [buyItem, buyItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const parsedBuyItemPayload = buyItemSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedBuyItemPayload.success) throw new FormError(FORM_ERRORS.ID_INVALID);

		const [itemToBuy, user] = await Promise.all([
			db.item.findUnique({ where: { id: parsedBuyItemPayload.data.id } }),
			db.user.findFirstOrThrow({ select: { balance: true }, where: { id: userId } }),
		]);

		if (!itemToBuy) throw new FormError(FORM_ERRORS.ITEM_NOT_FOUND);

		if (itemToBuy.price > user?.balance) throw new FormError(FORM_ERRORS.ITEM_TOO_EXPENSIVE);

		const promises: Array<Promise<any>> = [
			db.user.update({ data: { balance: user.balance - itemToBuy.price }, where: { id: userId } }),
		];

		if (itemToBuy.type !== 'RECURRING')
			promises.push(db.item.update({ data: { status: 'UNAVAILABLE' }, where: { id: itemToBuy.id } }));

		await Promise.all(promises);

		return redirect(request.headers.get('referer') ?? REDIRECTS.HOME);
	});

	const buyItemErrors = createFormFieldsErrors(() => buyItem.error);

	createEffect(() => {
		const error = errorElement();

		if (error && buyItemErrors()) {
			error.scrollIntoView();
		}
	});

	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p ref={setErrorElement} class="text-secondary max-w-3xl text-sm">
					Here you can find all items that you previously added and buy them! You can also add a new item by using the
					button next to this text.
				</p>
				<ButtonLink href="/app/shop/item/new">Add</ButtonLink>
			</div>
			<Show when={buyItemErrors().other}>
				<p class="text-destructive mb-6 text-sm">{buyItemErrors().other}</p>
			</Show>
			<p class="text-destructive text-sm" />
			<ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<For
					fallback={
						<h2 class="text-secondary text-center text-sm">
							You don't have any items yet. Go add your first one and start earning prizes for your hard work!
						</h2>
					}
					each={props.items}
				>
					{item => (
						<li
							role="listitem"
							class="flex flex-col justify-between gap-9 p-4 shadow shadow-black/50 dark:shadow-black/90"
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
										Is item recurring?{' '}
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
								<div class="h-20 w-20">
									<Show when={item.iconUrl} fallback={<i class="i-lucide-box text-8xl" aria-hidden />}>
										<img class="object-cover" src={item.iconUrl!} alt="" />
									</Show>
								</div>
							</div>
							<div class="flex justify-end gap-6">
								<buyItemTrigger.Form>
									<input type="hidden" value={item.id} name="id" />
									<Button>Buy</Button>
								</buyItemTrigger.Form>
								<ButtonLink href={`/app/shop/item/${item.id}`} variant="secondary">
									Edit
								</ButtonLink>
							</div>
						</li>
					)}
				</For>
			</ul>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<div class="my-6 flex">
					<Show when={props.currentPage !== 1}>
						<LinkWithIcon
							class="mr-auto"
							icon="i-lucide-arrow-big-left"
							href={props.currentPage === 2 ? '/app/shop' : `/app/shop/page/${props.currentPage - 1}`}
							end
						>
							Previous
						</LinkWithIcon>
					</Show>
					<Show when={props.hasNextPage}>
						<LinkWithIcon
							class="ml-auto"
							icon="i-lucide-arrow-big-right"
							href={`/app/shop/page/${props.currentPage + 1}`}
							end
						>
							Next
						</LinkWithIcon>
					</Show>
				</div>
			</Show>
		</>
	);
};
