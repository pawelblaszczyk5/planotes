import { faker } from '@faker-js/faker';
import {
	type Task,
	type Goal,
	type Note,
	type Item,
	PrismaClient,
	CompletableStatus,
	Size,
	Priority,
} from '@prisma/client';
import { calculatePayout } from '~/utils/calculatePayout';

const db = new PrismaClient();

const ITEMS_IN_SHOP_COUNT = 48;
const NOTES_COUNT = 48;
const GOALS_COUNT = 24;
const TASKS_COUNT = 128;
const USER_EMAIL = 'test@example.com';

const onboardUser = async (id: string) => {
	await db.user.update({
		data: {
			avatarSeed: faker.random.words(),
			balance: 0,
			name: faker.name.firstName(),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		},
		where: { id },
	});
};

const convertDateIntoSeconds = (date: Date) => Math.round(date.getTime() / 1_000);
const getDateInPastTwoMonths = () => faker.date.between(new Date(5_259_600_000), Date.now());

const generateHtmlContent = () => {
	const title = faker.random.words(faker.datatype.number({ max: 20, min: 4 }));
	const content = faker.random.words(faker.datatype.number({ max: 200, min: 50 }));

	return { htmlContent: `<h1>${title}</h1><p>${content}</p>`, textContent: `${title} ${content}` };
};

const generateStatusSizePriority = () =>
	({
		priority: faker.helpers.arrayElement([Priority.LOW, Priority.MEDIUM, Priority.HIGH]),
		size: faker.helpers.arrayElement([Size.XS, Size.S, Size.M, Size.L, Size.XL]),
		status: faker.helpers.arrayElement([
			CompletableStatus.TO_DO,
			CompletableStatus.ARCHIVED,
			CompletableStatus.IN_PROGRESS,
			CompletableStatus.COMPLETED,
		]),
	} as const);

const generateItem = (userId: string): Omit<Item, 'id'> => ({
	createdAt: convertDateIntoSeconds(getDateInPastTwoMonths()),
	iconUrl: faker.image.imageUrl(
		faker.datatype.number({ max: 500, min: 200 }),
		faker.datatype.number({ max: 500, min: 200 }),
	),
	name: faker.commerce.product(),
	price: faker.datatype.number({ max: 10_000, min: 500 }),
	status: 'AVAILABLE',
	type: faker.helpers.arrayElement(['ONE_TIME', 'RECURRING']),
	userId,
});

const createItemsForUser = async (userId: string, count: number) => {
	await db.item.createMany({
		data: Array.from({ length: count }, () => generateItem(userId)),
	});
};

const generateNote = (userId: string): Omit<Note, 'id'> => ({
	createdAt: convertDateIntoSeconds(getDateInPastTwoMonths()),
	name: faker.random.words(faker.datatype.number({ max: 5, min: 2 })),
	userId,
	...generateHtmlContent(),
});

const generateTask = (userId: string): Omit<Task, 'id'> => ({
	createdAt: convertDateIntoSeconds(getDateInPastTwoMonths()),
	title: faker.random.words(faker.datatype.number({ max: 5, min: 2 })),
	userId,
	...generateHtmlContent(),
	...generateStatusSizePriority(),
	goalId: null,
});

const generateGoal = (userId: string): Omit<Goal, 'id'> => ({
	createdAt: convertDateIntoSeconds(faker.date.past()),
	title: faker.random.words(faker.datatype.number({ max: 5, min: 2 })),
	userId,
	...generateHtmlContent(),
	...generateStatusSizePriority(),
});

const createNotesForUser = async (userId: string, count: number) => {
	await db.note.createMany({
		data: Array.from({ length: count }, () => generateNote(userId)),
	});
};

const createGoalsForUser = async (userId: string, count: number) => {
	await db.goal.createMany({
		data: Array.from({ length: count }, () => generateGoal(userId)),
	});
};

const createTasksForUser = async (userId: string, count: number) => {
	await db.task.createMany({
		data: Array.from({ length: count }, () => generateTask(userId)),
	});
};

const createBalanceEntries = async (userId: string) => {
	const completedTasks = await db.task.findMany({
		where: {
			status: 'COMPLETED',
			userId,
		},
	});

	const completedGoals = await db.task.findMany({
		where: {
			status: 'COMPLETED',
			userId,
		},
	});

	let userBalance = 0;

	const balanceEntriesForTasks = completedTasks.map(task => {
		const payout = calculatePayout('task', task.size);

		userBalance += payout;

		return db.balanceEntry.create({
			data: {
				change: payout,
				createdAt: convertDateIntoSeconds(faker.date.between(new Date(task.createdAt * 1_000), Date.now())),
				entity: 'TASK',
				itemId: task.id,
				userId,
			},
		});
	});

	const balanceEntriesForGoals = completedGoals.map(goal => {
		const payout = calculatePayout('goal', goal.size);

		userBalance += payout;

		return db.balanceEntry.create({
			data: {
				change: payout,
				createdAt: convertDateIntoSeconds(faker.date.between(new Date(goal.createdAt * 1_000), Date.now())),
				entity: 'GOAL',
				itemId: goal.id,
				userId,
			},
		});
	});

	const updateUserBalance = db.user.update({
		data: {
			balance: userBalance,
		},
		where: {
			id: userId,
		},
	});

	await Promise.all([balanceEntriesForGoals, balanceEntriesForTasks, updateUserBalance].flat());
};

const asignTasksToGoals = async (userId: string) => {
	const goals = await db.goal.findMany({
		select: {
			id: true,
			status: true,
		},
		where: {
			userId,
		},
	});
	const tasks = await db.task.findMany({
		select: {
			id: true,
			status: true,
		},
		where: {
			userId,
		},
	});

	const goalsForTaskByStatus = {
		[CompletableStatus.COMPLETED]: goals.filter(goal => goal.status === 'COMPLETED' || goal.status === 'IN_PROGRESS'),
		[CompletableStatus.IN_PROGRESS]: goals.filter(goal => goal.status === 'IN_PROGRESS'),
		[CompletableStatus.TO_DO]: goals.filter(goal => goal.status === 'TO_DO'),
		[CompletableStatus.ARCHIVED]: goals,
	} as const;

	const promises = tasks.flatMap(task => {
		if (Math.random() < 0.1) return [];

		const goalId = faker.helpers.arrayElement(goalsForTaskByStatus[task.status]).id;

		return db.task.update({
			data: {
				goalId,
			},
			where: {
				id: task.id,
			},
		});
	});

	await Promise.all(promises);
};

const buySomeItems = async (userId: string) => {
	let userBalance = (await db.user.findUniqueOrThrow({ select: { balance: true }, where: { id: userId } })).balance;
	const minimumBalanceLeft = faker.datatype.number({ max: userBalance, min: 500 });
	const items = (
		await db.item.findMany({
			select: {
				createdAt: true,
				id: true,
				price: true,
				type: true,
			},
			where: { status: 'AVAILABLE', userId },
		})
	).sort(() => 0.5 - Math.random());

	const promises: Array<Promise<unknown>> = [];

	for (const item of items) {
		if (userBalance - item.price < minimumBalanceLeft) continue;

		userBalance -= item.price;

		promises.push(
			db.balanceEntry.create({
				data: {
					change: -item.price,
					createdAt: convertDateIntoSeconds(faker.date.between(new Date(item.createdAt * 1_000), Date.now())),
					entity: 'ITEM',
					itemId: item.id,
					userId,
				},
			}),
			db.user.update({ data: { balance: { decrement: item.price } }, where: { id: userId } }),
		);

		if (item.type !== 'RECURRING')
			promises.push(db.item.update({ data: { status: 'UNAVAILABLE' }, where: { id: item.id } }));
	}

	await Promise.all(promises);
};

const seed = async () => {
	const { id } = await db.user.create({ data: { email: USER_EMAIL } });

	await onboardUser(id);
	await createItemsForUser(id, ITEMS_IN_SHOP_COUNT);
	await createNotesForUser(id, NOTES_COUNT);
	await createGoalsForUser(id, GOALS_COUNT);
	await createTasksForUser(id, TASKS_COUNT);
	await asignTasksToGoals(id);
	await createBalanceEntries(id);
	await buySomeItems(id);
};

try {
	await db.$connect();
	await seed();
} catch (error) {
	// eslint-disable-next-line no-console
	console.error(error);
	process.exit(1);
} finally {
	await db.$disconnect();
}
