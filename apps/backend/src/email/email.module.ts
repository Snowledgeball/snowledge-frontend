import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailHelper } from './email.helper';
import { EmailProvider } from './email.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './entities/email.entity';
import mailingConfig from '../config/mailing.config';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forFeature([Email]),
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [mailingConfig.KEY],
			useFactory: (mailingConfig) => ({
				transport: {
					host: mailingConfig.host,
					port: mailingConfig.port,
					secure: mailingConfig.secure,
					auth: {
						user: mailingConfig.user,
						pass: mailingConfig.pass,
					},
				},
				defaults: {
					from: mailingConfig.from,
				},
			}),
		}),
	],
	controllers: [EmailController],
	providers: [EmailHelper, EmailProvider, EmailService],
	exports: [EmailHelper, EmailProvider, EmailService],
})
export class EmailModule {}
