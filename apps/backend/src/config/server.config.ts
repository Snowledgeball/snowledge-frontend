import { registerAs } from '@nestjs/config';
import { ServerConfig } from './types/server';

export default registerAs('serverConfig', (): ServerConfig => {
	// console.log(process.env.ORIGIN_CORS);
	return {
		hostname: process.env.HOSTNAME || '0.0.0.0',
		port: parseInt(process.env.APP_PORT, 10) || 4000,
		tracing: true,
		engine: true,
		bodyParser: {
			limit: '50mb',
		},
		cors: {
			origin: process.env.ORIGIN_CORS
				? JSON.parse(process.env.ORIGIN_CORS).map((value) => {
						if (value.includes('localhost')) {
							return new RegExp(`http://${value}`);
						}
					})
				: [
						new RegExp(`https?://snowledge.eu`),
						new RegExp(`https://snowledge.eu`),
					],
			credentials: true,
		},
	};
});
