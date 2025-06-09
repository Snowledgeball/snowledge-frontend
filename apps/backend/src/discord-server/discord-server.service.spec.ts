import { Test, TestingModule } from '@nestjs/testing';
import { DiscordServerService } from './discord-server.service';

describe('DiscordServerService', () => {
  let service: DiscordServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordServerService],
    }).compile();

    service = module.get<DiscordServerService>(DiscordServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
