import { Test, TestingModule } from '@nestjs/testing';
import { ReturnService } from './return.service';

describe('ReturnService', () => {
  let service: ReturnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnService],
    }).compile();

    service = module.get<ReturnService>(ReturnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
