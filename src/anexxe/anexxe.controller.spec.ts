import { Test, TestingModule } from '@nestjs/testing';
import { AnexxeController } from './anexxe.controller';
import { AnexxeService } from './anexxe.service';

describe('AnexxeController', () => {
  let controller: AnexxeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnexxeController],
      providers: [AnexxeService],
    }).compile();

    controller = module.get<AnexxeController>(AnexxeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
