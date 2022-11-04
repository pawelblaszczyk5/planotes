import { type Transporter, createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { createStableModule } from '~/lib/utils/createStableModule';
import { env } from '~/lib/utils/env';

const transporterConfig: SMTPTransport.Options = {
	auth: {
		pass: env.SMTP_PASSWORD,
		user: env.SMTP_USER,
	},
	dkim: {
		domainName: 'planotes.xyz',
		keySelector: env.DKIM_SELECTOR,
		privateKey: env.DKIM_PRIVATE_KEY,
	},
	host: env.SMTP_HOST,
	port: 587,
};

export const transporter: Transporter = createStableModule('smtpTransporter', () => createTransport(transporterConfig));

type SendEmailOptions = {
	html: string;
	plainTextVersion?: string;
	receiver: string;
	senderName: string;
	subject: string;
};

type SendEmailResult = {
	accepted: Array<string>;
};

const sendEmail = async ({ html, receiver, plainTextVersion, senderName, subject }: SendEmailOptions) => {
	try {
		const { accepted }: SendEmailResult = await transporter.sendMail({
			from: `"${senderName}" <${env.SMTP_USER}>`,
			html,
			subject,
			text: plainTextVersion,
			to: receiver,
		});

		if (!accepted.includes(receiver)) throw new Error('Unable to send email');
	} catch {
		throw new Error('Unable to send email');
	}
};

export const sendEmailWithMagicLink = async (token: string, receiver: string) => {
	const magicLink = `${env.APP_URL}/magic?token=${token}`;

	// TODO: use MJML probably and make this email proper one
	await sendEmail({
		html: `Use <a href="${magicLink}" target="_blank">this link</a> to login`,
		plainTextVersion: `Use this link to login: ${magicLink}`,
		receiver,
		senderName: 'Planotes Magic Link',
		subject: 'Your magic link to use Planotes',
	});
};
