import { faker } from '@faker-js/faker';
import { type Note, type Item, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const ITEMS_IN_SHOP_COUNT = 36;
const NOTES_COUNT = 36;
const USER_EMAIL = 'test@example.com';

const onboardUser = async (id: string) => {
	await db.user.update({
		data: {
			avatarSeed: faker.random.words(),
			balance: faker.datatype.number({ max: 2_000, min: 500 }),
			name: faker.name.firstName(),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		},
		where: { id },
	});
};

const generateItem = (userId: string): Omit<Item, 'id'> => ({
	createdAt: Math.round(faker.date.past().getTime() / 1_000),
	iconUrl: faker.image.imageUrl(
		faker.datatype.number({ max: 500, min: 200 }),
		faker.datatype.number({ max: 500, min: 200 }),
	),
	name: faker.commerce.product(),
	price: faker.datatype.number({ max: 250, min: 100 }),
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
	content: `<h1>${faker.random.words(faker.datatype.number({ max: 5, min: 2 }))}</h1><p>${faker.random.words(
		faker.datatype.number({ max: 50, min: 25 }),
	)}</p>`,
	createdAt: Math.round(faker.date.past().getTime() / 1_000),
	name: faker.random.word(),
	userId,
});

const createNotesForUser = async (userId: string, count: number) => {
	await db.note.createMany({
		data: Array.from({ length: count }, () => generateNote(userId)),
	});
};

const seed = async () => {
	const { id } = await db.user.create({ data: { email: USER_EMAIL } });

	await onboardUser(id);
	await createItemsForUser(id, ITEMS_IN_SHOP_COUNT);
	await createNotesForUser(id, NOTES_COUNT);
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
