import { Test, TestingModule } from '@nestjs/testing';
import { SnowTestRegisterController } from './snow-test-register.controller';
import { SnowTestRegisterService } from './snow-test-register.service';

describe('SnowTestRegisterController', () => {
  let controller: SnowTestRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnowTestRegisterController],
      providers: [SnowTestRegisterService],
    }).compile();

    controller = module.get<SnowTestRegisterController>(SnowTestRegisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
