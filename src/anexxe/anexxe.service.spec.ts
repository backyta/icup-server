import { Test, TestingModule } from '@nestjs/testing';
import { AnexxeService } from './anexxe.service';

describe('AnexxeService', () => {
  let service: AnexxeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnexxeService],
    }).compile();

    service = module.get<AnexxeService>(AnexxeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
