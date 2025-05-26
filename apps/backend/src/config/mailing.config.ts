import { registerAs } from '@nestjs/config';
import { MailingConfig } from './types/mailing';

export default registerAs('mailingConfig', (): MailingConfig => {
	return {
		host: 'smtp-relay.brevo.com',
		port: Number(587),
		secure: false,
		user: '8d2dfc001@smtp-brevo.com', //
		pass: process.env.PASS_BREVO,
		from: '"Swnoledge" secure@swnoledge.net',
	};
});
