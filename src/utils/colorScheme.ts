import { createCookie } from 'solid-start/session';
import { z } from 'zod';
import { env } from '~/utils/env';

const colorScheme = z.enum(['DARK', 'LIGHT', 'SYSTEM']);

export type ColorScheme = z.infer<typeof colorScheme>;

const colorSchemeCookie = createCookie('csch', {
	domain: env.COOKIE_DOMAIN,
	httpOnly: true,
	path: '/',
	sameSite: 'strict',
	secure: true,
});

export const getColorScheme = async (request: Request) => {
	const cookie = await colorSchemeCookie.parse(request.headers.get('cookie'));
	const parsedColorScheme = colorScheme.safeParse(cookie);

	if (!parsedColorScheme.success) return 'SYSTEM';

	return parsedColorScheme.data;
};

export const saveColorSchemePreference = async (preferedColorScheme: ColorScheme) =>
	await colorSchemeCookie.serialize(preferedColorScheme);
