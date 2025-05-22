import { registerAs } from '@nestjs/config';
import { MailingConfig } from './types/mailing';

export default registerAs('mailingConfig', (): MailingConfig => {
	return {
		host: 'smtp-relay.brevo.com',
		port: Number(587),
		secure: false,
		user: '', //
		pass: process.env.PASS_BREVO,
		from: '"Behind The Gate" secure@behindthegate.io',
	};
});
