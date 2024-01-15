import { Module } from '@nestjs/common';
import { PenaltyController } from './penalty.controller';
import { PenaltyService } from './penalty.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [PenaltyController],
    providers: [PenaltyService],
    imports: [AuthModule],
})
export class PenaltyModule {}
