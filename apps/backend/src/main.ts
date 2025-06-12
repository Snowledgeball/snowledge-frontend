import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector)),
	);

	const configService = app.get(ConfigService);
	app.enableCors(configService.get('serverConfig.cors'));
	app.use(cookieParser());
	const swagger = process.env.SWAGGER ? JSON.parse(process.env.SWAGGER) : '';
	console.log('swagger', swagger);
	if (swagger) {
		const config = new DocumentBuilder()
			.addBearerAuth(
				{
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					name: 'JWT',
					in: 'header',
				},
				'access_token',
			)
			.setTitle('Snowlegde')
			.setDescription('The Snowledge API description')
			.setVersion('1.0')
			.addSecurityRequirements('access_token')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('swagger', app, document);
	}

	// Sert le dossier public à la racine de l'API
	app.useStaticAssets(join(__dirname, '..', 'public'));

	await app.listen(configService.get('serverConfig.port'));

	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
