import { Injectable } from '@nestjs/common';
import EmployeeSchema from 'src/db/schemas/employee.schema';
import {
    EmployeeArgs,
    BaseDocument,
    EmployeeSchemaType,
} from 'src/types/models';
import { genSaltSync, compareSync, hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
    async findUser(email: string): Promise<BaseDocument<EmployeeArgs> | null> {
        const user = await EmployeeSchema.findOne({ email });
        return user;
    }

    async createUser(userData: EmployeeArgs): Promise<EmployeeSchemaType> {
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
