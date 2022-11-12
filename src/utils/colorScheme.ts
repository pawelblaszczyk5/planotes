import { createCookie } from 'solid-start/session';
import { z } from 'zod';
import { env } from '~/utils/env';

const colorSchemeSchema = z.enum(['DARK', 'LIGHT', 'SYSTEM']);
const ONE_YEAR_IN_SECONDS = 31_556_926;

const colorSchemeCookie = createCookie('csch', {
	domain: env.COOKIE_DOMAIN,
	httpOnly: true,
	maxAge: ONE_YEAR_IN_SECONDS,
	path: '/',
	sameSite: 'strict',
	secure: true,
});

export type ColorScheme = z.infer<typeof colorSchemeSchema>;

export const getColorScheme = async (request: Request) => {
	const cookie = await colorSchemeCookie.parse(request.headers.get('cookie'));
	const parsedColorScheme = colorSchemeSchema.safeParse(cookie);

	if (!parsedColorScheme.success) return 'SYSTEM';

	return parsedColorScheme.data;
};

export const createColorSchemeCookie = async (preferedColorScheme: ColorScheme) =>
	colorSchemeCookie.serialize(preferedColorScheme);
