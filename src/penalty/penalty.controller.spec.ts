import { Test, TestingModule } from '@nestjs/testing';
import { PenaltyController } from './penalty.controller';
import { AuthModule } from '../auth/auth.module';
import { PenaltyService } from './penalty.service';
import { AuthService } from '../auth/auth.service';

describe('PenaltyController', () => {
    let controller: PenaltyController;
    let penaltyService: PenaltyService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PenaltyController],
            providers: [PenaltyService],
            imports: [AuthModule]
        }).compile();

        controller = module.get<PenaltyController>(PenaltyController);
        penaltyService = module.get(PenaltyService)
        authService = module.get(AuthService)
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks()
    })
});
