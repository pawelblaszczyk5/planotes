export const REDIRECTS = {
	GOALS: '/app/goals',
	HOME: '/app/home',
	MAIN: '',
	NOTES: '/app/notes',
	SHOP: '/app/shop',
	SIGN_IN: '/sign-in',
	TASKS: '/app/tasks',
} as const satisfies Record<string, string>;
