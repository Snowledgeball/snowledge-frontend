import { Test, TestingModule } from '@nestjs/testing';
import { DiscordServerController } from './discord-server.controller';

describe('DiscordServerController', () => {
  let controller: DiscordServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordServerController],
    }).compile();

    controller = module.get<DiscordServerController>(DiscordServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
