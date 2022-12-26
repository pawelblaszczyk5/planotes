import { type Item } from '@prisma/client';
import { For, Show, type JSXElement } from 'solid-js';
import { Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { AppMainLayout } from '~/components/AppMainLayout';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { MODULE_ICONS } from '~/constants/moduleIcons';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';
import { getEpochSeconds7DaysAgo } from '~/utils/time';

export const routeData = () => {
	const goalsTasksCreated = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const [tasksCount, goalsCount] = await Promise.all([
			db.task.count({
				where: {
					createdAt: {
						gte: getEpochSeconds7DaysAgo(),
					},
					userId,
				},
			}),
			db.goal.count({
				where: {
					createdAt: {
						gte: getEpochSeconds7DaysAgo(),
					},
					userId,
				},
			}),
		]);

		return tasksCount + goalsCount;
	});

	const goalsTasksClosed = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const count = await db.balanceEntry.count({
			where: {
				createdAt: {
					gte: getEpochSeconds7DaysAgo(),
				},
				entity: {
					in: ['GOAL', 'TASK'],
				},
				userId,
			},
		});

		return count;
	});

	const coinsEarned = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const count = (
			await db.balanceEntry.findMany({
				select: {
					change: true,
				},
				where: {
					createdAt: {
						gte: getEpochSeconds7DaysAgo(),
					},
					entity: {
						in: ['TASK', 'GOAL'],
					},
					userId,
				},
			})
		).reduce((sum, { change }) => sum + change, 0);

		return count;
	});

	const balanceHistory = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		const [history, user] = await Promise.all([
			db.balanceEntry.findMany({
				select: {
					change: true,
					createdAt: true,
				},
				where: {
					createdAt: {
						gte: getEpochSeconds7DaysAgo(),
					},
					userId,
				},
			}),
			db.user.findUniqueOrThrow({ select: { balance: true }, where: { id: userId } }),
		]);

		let currentBalance = user.balance;

		const mappedHistory = history
			.reverse()
			.map(({ change, createdAt }) => {
				const entry = {
					balance: currentBalance,
					createdAt,
				};

				currentBalance -= change;

				return entry;
			})
			.reverse();

		return mappedHistory;
	});

	const itemsToBuy = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const user = await db.user.findUniqueOrThrow({ select: { balance: true }, where: { id: userId } });

		return db.item.findMany({
			orderBy: {
				price: 'desc',
			},
			select: {
				iconUrl: true,
				name: true,
				price: true,
			},
			take: 10,
			where: {
				price: {
					lte: Math.round(user.balance * 1.2),
				},
				status: 'AVAILABLE',
				userId,
			},
		});
	});

	const recentlyBoughtItems = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);
		const itemsBoughtIds = (
			await db.balanceEntry.findMany({
				select: {
					itemId: true,
				},
				where: {
					createdAt: {
						gte: getEpochSeconds7DaysAgo(),
					},
					entity: 'ITEM',
					userId,
				},
			})
		).map(({ itemId }) => itemId);

		return db.item.findMany({
			where: {
				id: {
					in: itemsBoughtIds,
				},
				userId,
			},
		});
	});

	const notesAdded = createServerData$(async (_, { request }) => {
		const userId = await requireUserId(request);

		return db.note.count({
			where: {
				createdAt: {
					gte: getEpochSeconds7DaysAgo(),
				},
				userId,
			},
		});
	});

	return {
		balanceHistory,
		coinsEarned,
		goalsTasksClosed,
		goalsTasksCreated,
		itemsToBuy,
		notesAdded,
		recentlyBoughtItems,
	};
};

const AnalyticTile = (props: { title: JSXElement; value: JSXElement }) => (
	<div class="bg-secondary flex flex-col items-center justify-between gap-3 rounded p-6 text-center shadow shadow-black/50 dark:shadow-black/90">
		<span class="text-xl">{props.title}</span>
		<span class="text-accent font-500 text-xl">{props.value}</span>
	</div>
);

const ItemsCarousel = (props: { items: Array<Pick<Item, 'iconUrl' | 'name' | 'price'>>; title: JSXElement }) => (
	<div>
		<h2 class="text-2xl">{props.title}</h2>
		<div class="h-110 flex snap-x snap-mandatory items-center gap-6 overflow-y-auto py-6">
			<For
				each={props.items}
				fallback={<p class="text-secondary text-center text-sm">You don't have anything here yet</p>}
			>
				{item => (
					<div class="bg-secondary min-w-1/4 max-w-1/4 flex h-full flex-col items-start justify-between gap-3 rounded p-6 text-center shadow shadow-black/50 dark:shadow-black/90">
						<Show when={item.iconUrl} fallback={<i class="i-lucide-box aspect-square h-full w-full" aria-hidden />}>
							<img alt="" src={item.iconUrl!} class="aspect-square h-full object-contain" />
						</Show>
						<span class="mt-3 text-xl">{item.name}</span>
						<span class="text-accent font-500 text-xl">
							<TextAlignedIcon icon={MODULE_ICONS.shop}>{item.price}</TextAlignedIcon>
						</span>
					</div>
				)}
			</For>
		</div>
	</div>
);

const Home = () => {
	const {
		goalsTasksCreated,
		goalsTasksClosed,
		balanceHistory,
		itemsToBuy,
		recentlyBoughtItems,
		coinsEarned,
		notesAdded,
	} = useRouteData<typeof routeData>();

	return (
		<>
			<Title>Home | Planotes</Title>
			<AppMainLayout heading="Home">
				<p class="text-secondary mb-6 max-w-3xl text-sm">
					Here you can find some stats from a last week of your Planotes usage. You can quickly check out your progress
					or find out the prizes that you're close to or bought already.
				</p>
				<div class="my-6 flex flex-col gap-12">
					<div>
						<h2 class="mb-6 text-2xl">Quick numbers</h2>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
							<AnalyticTile title="Goals and tasks created" value={goalsTasksCreated()} />
							<AnalyticTile title="Goals and tasks closed" value={goalsTasksClosed()} />
							<AnalyticTile title="Coins earned" value={coinsEarned()} />
							<AnalyticTile title="Notes added" value={notesAdded()} />
						</div>
					</div>
					<ItemsCarousel title="Items to buy soon" items={itemsToBuy() ?? []} />
					<ItemsCarousel title="Recently bought items" items={recentlyBoughtItems() ?? []} />
				</div>
			</AppMainLayout>
		</>
	);
};

export default Home;
