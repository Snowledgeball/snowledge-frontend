import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailHelper {
	constructor(private readonly mailerService: MailerService) {}

	async codeEmail(email: string, code: number) {
		// const { email, name } = data;

		const subject = `Code d'identification`;

		await this.mailerService.sendMail({
			to: email,
			subject,
			text: `Voici le code à fournir pour finaliser ton identification : ${code}`,
		});
	}

	async tokenEmail(email: string, code: string) {
		// const { email, name } = data;

		const subject = `Code d'identification`;

		await this.mailerService.sendMail({
			to: email,
			subject,
			text: `Veuillez cliquer sur le lien suivant pour valider votre adresse mail : ${process.env.FRONT_URL}/fr/profile?token=${code}`,
		});
	}
}
