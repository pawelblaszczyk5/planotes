import { SessionDuration } from '@prisma/client';
import { redirect } from 'solid-start';
import { createCookie, createCookieSessionStorage } from 'solid-start/session';
import { z } from 'zod';
import { env } from '~/lib/utils/env';
import { convertEpochSecondsToDate, getCurrentEpochSeconds, getDateWithOffset, isDateInPast } from '~/lib/utils/time';

export const MAGIC_LINK_VALIDITY_IN_MINUTES = 15;
export const MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES = 2;

const SESSION_DURATION_IN_DAYS: Record<SessionDuration, number> = {
	[SessionDuration.PERSISTENT]: 30,
	[SessionDuration.EPHEMERAL]: 1,
} as const;

const sessionStorage = createCookieSessionStorage({
	cookie: {
		domain: env.COOKIE_DOMAIN,
		httpOnly: true,
		name: 'sesid',
		path: '/',
		sameSite: 'strict',
		secrets: [env.SESSION_SECRET],
		secure: true,
	},
});

const getSession = async (request: Request) => sessionStorage.getSession(request.headers.get('cookie'));
const { destroySession, commitSession } = sessionStorage;

const SESSION_KEYS = {
	USER_ID: 'userId',
	VALID_UNTIL: 'validUntil',
} as const;

const sessionSchema = z.object({
	[SESSION_KEYS.USER_ID]: z.string().cuid(),
	[SESSION_KEYS.VALID_UNTIL]: z.number(),
});

const magicIdentifier = createCookie('magid', {
	domain: env.COOKIE_DOMAIN,
	httpOnly: true,
	maxAge: MAGIC_LINK_VALIDITY_IN_MINUTES * 60,
	path: '/',
	sameSite: 'strict',
	secrets: [env.MAGIC_IDENTIFIER_SECRET],
	secure: true,
});

export const createMagicIdentifierCookie = async (magicLinkId: string) => magicIdentifier.serialize(magicLinkId);
export const getMagicIdentifier = async (request: Request) => magicIdentifier.parse(request.headers.get('cookie'));

export const createSessionCookie = async ({
	userId,
	sessionDuration,
	request,
}: {
	request: Request;
	sessionDuration: SessionDuration;
	userId: string;
}) => {
	const session = await getSession(request);
	const validUntil = getDateWithOffset({ days: SESSION_DURATION_IN_DAYS[sessionDuration] }).epochSeconds;

	session.set(SESSION_KEYS.USER_ID, userId);
	session.set(SESSION_KEYS.VALID_UNTIL, validUntil);

	return commitSession(session, {
		maxAge: sessionDuration === SessionDuration.EPHEMERAL ? undefined : validUntil - getCurrentEpochSeconds(),
	});
};

export const createLogOutCookie = async (request: Request) => {
	const session = await getSession(request);
	const cookie = await destroySession(session);

	return cookie;
};

export const requireUserId = async (request: Request) => {
	const session = await getSession(request);
	const parsedSession = sessionSchema.safeParse(session.data);

	if (!parsedSession.success || isDateInPast(convertEpochSecondsToDate(parsedSession.data.validUntil))) {
		const cookie = await destroySession(session);

		throw redirect('/', { headers: { 'Set-Cookie': cookie } });
	}

	return parsedSession.data.userId;
};

export const isUserLoggedIn = async (request: Request) => {
	const session = await getSession(request);
	const parsedSession = sessionSchema.safeParse(session.data);

	return parsedSession.success && !isDateInPast(convertEpochSecondsToDate(parsedSession.data.validUntil));
};
