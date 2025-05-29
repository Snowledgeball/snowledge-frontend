import { Test, TestingModule } from '@nestjs/testing';
import { LearnerService } from './learner.service';

describe('LearnerService', () => {
  let service: LearnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearnerService],
    }).compile();

    service = module.get<LearnerService>(LearnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
