import { createCookie } from 'solid-start/session';
import { z } from 'zod';
import { env } from '~/lib/main/utils/env';

const colorScheme = z.enum(['DARK', 'LIGHT', 'SYSTEM']);
const ONE_YEAR_IN_SECONDS = 31_556_926;

const colorSchemeCookie = createCookie('csch', {
	domain: env.COOKIE_DOMAIN,
	httpOnly: true,
	maxAge: ONE_YEAR_IN_SECONDS,
	path: '/',
	sameSite: 'strict',
	secure: true,
});

export type ColorScheme = z.infer<typeof colorScheme>;

export const getColorScheme = async (request: Request) => {
	const cookie = await colorSchemeCookie.parse(request.headers.get('cookie'));
	const parsedColorScheme = colorScheme.safeParse(cookie);

	if (!parsedColorScheme.success) return 'SYSTEM';

	return parsedColorScheme.data;
};

export const createColorSchemeCookie = async (preferedColorScheme: ColorScheme) =>
	await colorSchemeCookie.serialize(preferedColorScheme);
