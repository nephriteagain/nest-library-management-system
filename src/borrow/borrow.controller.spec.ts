import { Test, TestingModule } from '@nestjs/testing';
import { BorrowController } from './borrow.controller';

describe('BorrowController', () => {
  let controller: BorrowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowController],
    }).compile();

    controller = module.get<BorrowController>(BorrowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
