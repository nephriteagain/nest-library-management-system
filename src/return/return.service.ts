import { Injectable } from '@nestjs/common';
import ReturnSchema from 'src/db/schemas/return.schema';
import { ObjectId } from 'mongoose';
import { ReturnArgs, ReturnSchemaType } from 'src/types/models';

@Injectable()
export class ReturnService {
    constructor() {}

    async getReturnList(): Promise<ReturnSchemaType[]> {
        return ReturnSchema.find({}).sort('desc').limit(20);
    }

    async getReturnItem(returnId: ObjectId): Promise<ReturnSchemaType | null> {
        return ReturnSchema.findById(returnId);
    }

    async addEntry(
        newEntry: ReturnArgs,
        approvedBy: ObjectId,
    ): Promise<ReturnSchemaType> {
        const newReturnEntry = ReturnSchema.create({ ...newEntry, approvedBy });
        return newReturnEntry;
    }
}
