import { Module } from '@nestjs/common';
import { SnowTestRegisterService } from './snow-test-register.service';
import { SnowTestRegisterController } from './snow-test-register.controller';

@Module({
  controllers: [SnowTestRegisterController],
  providers: [SnowTestRegisterService],
})
export class SnowTestRegisterModule {}
