import { Test, TestingModule } from '@nestjs/testing';
import { SnowTestRegisterService } from './snow-test-register.service';

describe('SnowTestRegisterService', () => {
  let service: SnowTestRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SnowTestRegisterService],
    }).compile();

    service = module.get<SnowTestRegisterService>(SnowTestRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
