import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { LoggerMiddleware } from '../common/middleware/logger/logger.middleware';

@Module({
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
