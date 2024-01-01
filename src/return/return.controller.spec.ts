import { Test, TestingModule } from '@nestjs/testing';
import { ReturnController } from './return.controller';

describe('ReturnController', () => {
  let controller: ReturnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnController],
    }).compile();

    controller = module.get<ReturnController>(ReturnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
