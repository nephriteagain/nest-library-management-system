import { Injectable } from '@nestjs/common';
import EmployeeSchema from '../db/schemas/employee.schema';
import {
    EmployeeArgs,
    BaseDocument,
    EmployeeSchemaType,
    P,
} from '../types/models';
import { genSaltSync, compareSync, hashSync } from 'bcrypt';
import { ObjectId } from 'mongoose';

interface IUsersService {
    findUser: (email: string) => P<EmployeeSchemaType | null>;
    getUser: (_id: ObjectId) => P<EmployeeSchemaType | null>;
    createUser: (userData: EmployeeArgs) => P<{
        email: string;
        _id: ObjectId;
        name: string;
        age: number;
        joinData: number;
    }>;
    loginUser: (password: string, hashedPassword: string) => P<boolean>;
}

@Injectable()
export class UsersService implements IUsersService {
    employeeSchema: typeof EmployeeSchema;
    constructor(employeeSchema: typeof EmployeeSchema) {
        this.employeeSchema = employeeSchema;
    }

    async findUser(email: string): Promise<EmployeeSchemaType | null> {
        const user = await this.employeeSchema.findOne({ email });
        return user;
    }

    async getUser(_id: ObjectId): Promise<EmployeeSchemaType | null> {
        const user = await this.employeeSchema.findById(_id);
        return user;
    }

    async createUser(userData: EmployeeArgs) {
        const salt = genSaltSync();
        const hashedPassword = hashSync(userData.password, salt);

        const newUser = await this.employeeSchema.create({
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
