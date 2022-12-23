import { MODULE_ICONS } from '~/constants/moduleIcons';

export const ROUTES = [
	{ href: '/app/home', icon: MODULE_ICONS.home, title: 'Home' },
	{ href: '/app/goals', icon: MODULE_ICONS.goals, title: 'Goals' },
	{ href: '/app/tasks', icon: MODULE_ICONS.tasks, title: 'Tasks' },
	{ href: '/app/notes', icon: MODULE_ICONS.notes, title: 'Notes' },
	{ href: '/app/shop', icon: MODULE_ICONS.shop, title: 'Shop' },
] as const satisfies ReadonlyArray<Readonly<{ href: string; icon: string; title: string }>>;
