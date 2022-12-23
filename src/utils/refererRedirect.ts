import { env } from '~/utils/env';

export const sanitizeRefererRedirect = (request: Request, defaultUrl: string) => {
	try {
		const url = new URL(request.headers.get('referer') ?? '');

		if (url.origin !== env.APP_URL) return defaultUrl;

		return url.pathname;
	} catch {
		return defaultUrl;
	}
};
