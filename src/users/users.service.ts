import { Injectable } from '@nestjs/common';
import EmployeeSchema from 'src/db/schemas/employee.schema';
import {
    EmployeeArgs,
    BaseDocument,
    EmployeeSchemaType,
} from 'src/types/models';
import { genSaltSync, compareSync, hashSync } from 'bcrypt';
import { ObjectId } from 'mongoose';

@Injectable()
export class UsersService {
    async findUser(email: string): Promise<EmployeeSchemaType | null> {
        const user = await EmployeeSchema.findOne({ email });
        return user;
    }

    async getUser(_id: ObjectId): Promise<EmployeeSchemaType | null> {
        const user = await EmployeeSchema.findById(_id);
        return user;
    }

    async createUser(userData: EmployeeArgs) {
        const salt = genSaltSync();
        const hashedPassword = hashSync(userData.password, salt);

        const newUser = await EmployeeSchema.create({
            ...userData,
            password: hashedPassword,
        });
        const withoutPassword = {
            email: newUser.email,
            _id: newUser._id,
            name: newUser.name,
            age: newUser.age,
            joinData: newUser.joinDate,
        };
        return withoutPassword;
    }

    async loginUser(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        const status = compareSync(password, hashedPassword);
        return status;
    }
}
