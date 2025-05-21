import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface ServerConfig {
	hostname: string;
	port: number;
	tracing: boolean;
	engine: boolean;
	bodyParser: { limit: string };
	cors: CorsOptions;
}
