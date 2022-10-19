import { randomBytes } from 'node:crypto';
import { SessionDuration } from '@prisma/client';
import { redirect } from 'solid-start';
import { FormError } from 'solid-start/data';
import { createCookie, createCookieSessionStorage } from 'solid-start/session';
import { z } from 'zod';
import { db } from '~/utils/db';
import { env } from '~/utils/env';
import { sendEmailWithMagicLink } from '~/utils/mail';
import { convertEpochSecondsToDate, getCurrentEpochSeconds, getDateWithOffset, isDateInPast } from '~/utils/time';

const MAGIC_LINK_VALIDITY_IN_MINUTES = 15;
const MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES = 2;

const SESSION_KEYS = {
	USER_ID: 'userId',
	VALID_UNTIL: 'validUntil',
} as const;

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
const getSession = async (request: Request) => await sessionStorage.getSession(request.headers.get('cookie'));
const { destroySession, commitSession } = sessionStorage;
const sessionSchema = z.object({
	[SESSION_KEYS.USER_ID]: z.string().uuid(),
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

export const sendMagicLink = async (email: string, sessionDuration: SessionDuration) => {
	const { id: userId } = await db.user.upsert({
		create: {
			email,
		},
		update: {},
		where: {
			email,
		},
	});

	const previousMagicLink = await db.magicLink.findFirst({
		where: {
			userId: {
				equals: userId,
			},
			validUntil: {
				gte: getDateWithOffset({
					minutes: MAGIC_LINK_VALIDITY_IN_MINUTES - MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
				}).epochSeconds,
			},
		},
	});

	if (previousMagicLink) throw new FormError('Error');

	const token = randomBytes(32).toString('base64url');
	const { id: magicLinkId } = await db.magicLink.create({
		data: {
			sessionDuration,
			token,
			userId,
			validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
		},
	});

	try {
		await sendEmailWithMagicLink(token, email);
	} catch {
		await db.magicLink.delete({
			where: {
				id: magicLinkId,
			},
		});

		throw new FormError('Error');
	}

	return await magicIdentifier.serialize(magicLinkId);
};

export const verifyMagicToken = async (magicToken: string, request: Request) => {
	const magicIdentifierFromCookie = await magicIdentifier.parse(request.headers.get('cookie'));

	if (!magicIdentifierFromCookie) throw new FormError('Error');

	const magicLink = await db.magicLink.findUnique({
		where: { id: magicIdentifierFromCookie },
	});

	if (!magicLink) throw new FormError('Error');

	const { validUntil, token, userId, sessionDuration } = magicLink;

	if (isDateInPast(convertEpochSecondsToDate(validUntil)) || magicToken !== token) throw new FormError('error');

	const session = await getSession(request);

	session.set(SESSION_KEYS.USER_ID, userId);
	session.set(
		SESSION_KEYS.VALID_UNTIL,
		getDateWithOffset({ days: SESSION_DURATION_IN_DAYS[sessionDuration] }).epochSeconds,
	);

	const cookie = await commitSession(session, {
		maxAge: sessionDuration === SessionDuration.EPHEMERAL ? undefined : validUntil - getCurrentEpochSeconds(),
	});

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

export const logout = async (request: Request) => {
	const session = await getSession(request);
	const cookie = await destroySession(session);

	return cookie;
};
