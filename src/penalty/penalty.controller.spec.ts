import { Test, TestingModule } from '@nestjs/testing';
import { PenaltyController } from './penalty.controller';

describe('PenaltyController', () => {
  let controller: PenaltyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenaltyController],
    }).compile();

    controller = module.get<PenaltyController>(PenaltyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
