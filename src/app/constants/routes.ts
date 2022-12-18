export const ROUTES = [
	{ href: '/app/home', icon: 'i-lucide-home', title: 'Home' },
	{ href: '/app/habits', icon: 'i-lucide-recycle', title: 'Habits' },
	{ href: '/app/goals', icon: 'i-lucide-compass', title: 'Goals' },
	{ href: '/app/tasks', icon: 'i-lucide-clipboard-check', title: 'Tasks' },
	{ href: '/app/notes', icon: 'i-lucide-sticky-note', title: 'Notes' },
	{ href: '/app/shop', icon: 'i-lucide-coins', title: 'Shop' },
] as const satisfies ReadonlyArray<Readonly<{ href: string; icon: string; title: string }>>;
