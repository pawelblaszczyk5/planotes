export const REDIRECTS = {
	HOME: '/app/home',
	MAIN: '',
	SHOP: '/app/shop',
	SIGN_IN: '/sign-in',
} as const satisfies Record<string, string>;
