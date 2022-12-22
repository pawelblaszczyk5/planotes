import { redirect } from 'solid-start';
import { REDIRECTS } from '~/constants/redirects';
import { db } from '~/utils/db';

export const ITEMS_PER_PAGE = 12;

export const getPaginatedItems = async (pageParam: number | string, userId: string) => {
	const page = Number(pageParam);

	if (Number.isNaN(page) || page < 1) throw redirect(REDIRECTS.NOTES);

	const items = await db.item.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		skip: (page - 1) * ITEMS_PER_PAGE,
		take: ITEMS_PER_PAGE + 1,
		where: {
			status: 'AVAILABLE',
			userId,
		},
	});

	const itemsPage = items.slice(0, ITEMS_PER_PAGE);

	if (page > 1 && !itemsPage.length) throw redirect(REDIRECTS.NOTES);

	return { hasNextPage: items.length === ITEMS_PER_PAGE + 1, items: itemsPage, page };
};

export const getPaginatedNotes = async (pageParam: number | string, userId: string) => {
	const page = Number(pageParam);

	if (Number.isNaN(page) || page < 1) throw redirect(REDIRECTS.NOTES);

	const notes = await db.note.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			createdAt: true,
			id: true,
			name: true,
			textContent: true,
		},
		skip: (page - 1) * ITEMS_PER_PAGE,
		take: ITEMS_PER_PAGE + 1,
		where: {
			userId,
		},
	});

	const notesPage = notes.slice(0, ITEMS_PER_PAGE).map(note => {
		const noteWithSlimmedTextContent = {
			...note,
			textContent: note.textContent.slice(0, 200),
		};

		return noteWithSlimmedTextContent;
	});

	if (page > 1 && !notesPage.length) throw redirect(REDIRECTS.NOTES);

	return { hasNextPage: notes.length === ITEMS_PER_PAGE + 1, notes: notesPage, page };
};
