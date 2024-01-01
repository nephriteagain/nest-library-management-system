import { Module } from '@nestjs/common';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ReturnController],
  providers: [ReturnService, AuthService],
  imports: [UsersModule]
})
export class ReturnModule {}
