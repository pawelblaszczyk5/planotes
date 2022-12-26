import { Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { AppMainLayout } from '~/components/AppMainLayout';
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
			where: {
				price: {
					lte: user.balance * 1.2,
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

	return { balanceHistory, goalsTasksClosed, goalsTasksCreated, itemsToBuy, recentlyBoughtItems };
};

const Home = () => {
	const { goalsTasksCreated, goalsTasksClosed, balanceHistory, itemsToBuy, recentlyBoughtItems } =
		useRouteData<typeof routeData>();

	return (
		<>
			<Title>Home | Planotes</Title>
			<AppMainLayout heading="Home">Lorem Ipsum</AppMainLayout>
		</>
	);
};

export default Home;
