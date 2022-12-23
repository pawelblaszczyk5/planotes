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

export const getPaginatedGoals = async (pageParam: number | string, userId: string) => {
	const page = Number(pageParam);

	if (Number.isNaN(page) || page < 1) throw redirect(REDIRECTS.GOALS);

	const goals = await db.goal.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			createdAt: true,
			id: true,
			priority: true,
			size: true,
			status: true,
			Task: {
				select: { status: true },
				where: {
					status: {
						not: 'ARCHIVED',
					},
				},
			},
			textContent: true,
			title: true,
		},
		skip: (page - 1) * ITEMS_PER_PAGE,
		take: ITEMS_PER_PAGE + 1,
		where: {
			status: {
				in: ['IN_PROGRESS', 'TO_DO'],
			},
			userId,
		},
	});

	const goalsPage = goals.slice(0, ITEMS_PER_PAGE).map(goal => {
		const { Task, textContent, ...rest } = goal;
		const completedTasks = Task.filter(({ status }) => status === 'COMPLETED').length;

		const progressPercent = (completedTasks / Task.length) * 100;

		return {
			...rest,
			progress: progressPercent < 50 ? Math.round(progressPercent) : Math.floor(progressPercent),
			textContent: textContent.slice(0, 200),
		};
	});

	if (page > 1 && !goalsPage.length) throw redirect(REDIRECTS.GOALS);

	return { goals: goalsPage, hasNextPage: goals.length === ITEMS_PER_PAGE + 1, page };
};

export const getPaginatedTasks = async (pageParam: number | string, userId: string) => {
	const page = Number(pageParam);

	if (Number.isNaN(page) || page < 1) throw redirect(REDIRECTS.TASKS);

	const tasks = await db.task.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			createdAt: true,
			id: true,
			priority: true,
			size: true,
			status: true,
			textContent: true,
			title: true,
		},
		skip: (page - 1) * ITEMS_PER_PAGE,
		take: ITEMS_PER_PAGE + 1,
		where: {
			status: {
				in: ['IN_PROGRESS', 'TO_DO'],
			},
			userId,
		},
	});

	const tasksPage = tasks.slice(0, ITEMS_PER_PAGE).map(task => {
		const taskWithSlimmedTextContent = {
			...task,
			textContent: task.textContent.slice(0, 200),
		};

		return taskWithSlimmedTextContent;
	});

	if (page > 1 && !tasksPage.length) throw redirect(REDIRECTS.TASKS);

	return { hasNextPage: tasks.length === ITEMS_PER_PAGE + 1, page, tasks: tasksPage };
};
