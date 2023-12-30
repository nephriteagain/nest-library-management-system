import { Injectable } from '@nestjs/common';
import { Document, ObjectId } from 'mongoose';
import EmployeeSchema from 'src/db/schemas/employee.schema';
import { Employee, BaseDocument } from 'src/types/models';
import { genSaltSync, compareSync, hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
    async findUser(email: string): Promise<BaseDocument<Employee> | null> {
        console.log('finding user')
        const user = await EmployeeSchema.findOne({ email });
        return user;
    }

    async createUser(userData: Employee): Promise<BaseDocument<Employee>> {
        const salt = genSaltSync();
        const hashedPassword = hashSync(userData.password, salt);

        const newUser = EmployeeSchema.create({
            ...userData,
            password: hashedPassword,
        });
        return newUser;
    }

    async loginUser(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        const status = compareSync(password, hashedPassword);
        return status;
    }
}
