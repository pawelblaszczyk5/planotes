import { type Transporter, createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { createStableModule } from '~/utils/createStableModule';
import { env } from '~/utils/env';

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

const getMagicLinkHtml = (
	magicLink: string,
) => `<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title>Planotes - your magic link</title><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
p { display:block;margin:13px 0; }</style><!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]--><!--[if lte mso 11]>
<style type="text/css">
.mj-outlook-group-fix { width:100% !important; }
</style>
<![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px) {
.mj-column-per-30 { width:30% !important; max-width: 30%; }
.mj-column-per-70 { width:70% !important; max-width: 70%; }
.mj-column-per-100 { width:100% !important; max-width: 100%; }
}</style><style media="screen and (min-width:480px)">.moz-text-html .mj-column-per-30 { width:30% !important; max-width: 30%; }
.moz-text-html .mj-column-per-70 { width:70% !important; max-width: 70%; }
.moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }</style><style type="text/css">@media only screen and (max-width:480px) {
table.mj-full-width-mobile { width: 100% !important; }
td.mj-full-width-mobile { width: auto !important; }
}</style></head><body style="word-spacing:normal;background-color:rgb(23,23,23);"><div style="background-color:rgb(23,23,23);"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:32px 8px 0;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:175.2px;" ><![endif]--><div class="mj-column-per-30 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tbody><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:60px;"><img height="auto" src="${env.APP_URL}/android-chrome-256x256.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="60"></td></tr></tbody></table></td></tr></tbody></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:middle;width:408.8px;" ><![endif]--><div class="mj-column-per-70 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:42px;line-height:1;text-align:left;color:rgb(229,229,229);">Planotes</div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="center" style="font-size:0px;padding:16px 16px 32px;word-break:break-word;"><p style="border-top:solid 4px rgb(232,121,249);font-size:1px;margin:0px auto;width:100%;"></p><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px rgb(232,121,249);font-size:1px;margin:0px auto;width:568px;" role="presentation" width="568px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]--></td></tr><tr><td align="left" style="font-size:0px;padding:16px 16px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:28px;line-height:1;text-align:left;color:rgb(229,229,229);">Hello 👋!</div></td></tr><tr><td align="left" style="font-size:0px;padding:16px 16px 16px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;line-height:150%;text-align:left;color:rgb(229,229,229);">I'm glad to see you singing in into Planotes. I hope you'll have a blast using it. Good luck with your planning and noting 😁</div></td></tr><tr><td align="left" style="font-size:0px;padding:8px 16px 32px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;line-height:150%;text-align:left;color:rgb(229,229,229);">Use below link to complete the sign in process!</div></td></tr><tr><td align="left" vertical-align="middle" style="font-size:0px;padding:8px 16px 16px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tr><td align="center" bgcolor="rgb(23,23,23)" role="presentation" style="border:2px solid rgb(232,121,249);border-radius:6;cursor:auto;mso-padding-alt:10px 25px;background:rgb(23,23,23);" valign="middle"><a href="${magicLink}" style="display:inline-block;background:rgb(23,23,23);color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:6;" target="_blank">Click here</a></td></tr></table></td></tr><tr><td align="left" style="font-size:0px;padding:48px 16px 32px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:14px;line-height:150%;text-align:left;color:rgb(163,163,163);">In case you didn't ask for a mail with magic link it's safe to ignore this mail. No one can access your account without above link.</div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>`;

export const sendEmailWithMagicLink = async (token: string, receiver: string) => {
	const magicLink = `${env.APP_URL}/magic?token=${token}`;

	await sendEmail({
		html: getMagicLinkHtml(magicLink),
		plainTextVersion: `Welcome! You've got this email because someone tried to sign in with this address to Planotes. You can use below link to complete the login. Otherwise it's safe to ignore it :) ${magicLink}`,
		receiver,
		senderName: 'Planotes Magic Link',
		subject: 'Your magic link to use Planotes',
	});
};
