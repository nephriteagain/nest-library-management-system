import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import employeeSchema from '../db/schemas/employee.schema';

@Module({
    providers: [
        {
            provide: UsersService,
            useValue: new UsersService(employeeSchema),
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
