import { registerAs } from '@nestjs/config';
import { MongoConfig } from './types/mongo';

export default registerAs(
	'mongoConfig',
	(): MongoConfig => ({
		host: process.env.MG_HOST ?? '127.0.0.1',
		port: parseInt(process.env.MG_PORT) ?? 27017,
		database: process.env.MG_DB ?? '',
		usernameMongo: process.env.MG_USER ?? '',
		password: process.env.MG_PASSWORD ?? '',
	}),
);

export function formatURIMongo(config: MongoConfig) {
	const { host, usernameMongo, password, database, port } = config;

    const isSRV = !['127.0.0.1', 'localhost', 'mongo'].includes(host);
    const hostDB = isSRV ? '+srv' : '';

	let auth = '';
	if (usernameMongo) {
		auth = `${usernameMongo}:${encodeURIComponent(password || '')}@`;
	}
	const portDB = host !== '127.0.0.1' ? '' : `:${port}`;
    console.log(`mongodb${hostDB}://${auth}${host}${portDB}/${database}`)
	return `mongodb${hostDB}://${auth}${host}${portDB}/${database}`;
}
