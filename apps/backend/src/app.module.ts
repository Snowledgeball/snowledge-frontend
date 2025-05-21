import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CommunityModule } from './community/community.module';
import serverConfig from './config/server.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env.prod'],
			isGlobal: true,
			load: [serverConfig,],
		}),
    UserModule,
    CommunityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
