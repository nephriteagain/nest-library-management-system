import { Test, TestingModule } from '@nestjs/testing';
import { BorrowService } from './borrow.service';

describe('BorrowService', () => {
  let service: BorrowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowService],
    }).compile();

    service = module.get<BorrowService>(BorrowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
