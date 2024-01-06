import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    providers: [MembersService],
    controllers: [MembersController],
    imports: [AuthModule, UsersModule],
})
export class MembersModule {}
