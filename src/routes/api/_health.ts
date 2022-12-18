import { db } from '~/shared/utils/db';
import { transporter } from '~/shared/utils/mail';

const verifySmtpConnection = async () => {
	await transporter.verify();
};

const verifyDbConnection = async () => {
	await db.user.findFirst();
};

export const GET = async () => {
	try {
		await Promise.all([verifyDbConnection(), verifySmtpConnection()]);
	} catch {
		return new Response(undefined, { status: 500 });
	}

	return new Response(undefined, { status: 200 });
};
