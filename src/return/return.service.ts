import { Injectable } from '@nestjs/common';
import ReturnSchema from 'src/db/schemas/return.schema';
import { ObjectId } from 'mongoose';
import { Query, ReturnArgs, ReturnSchemaType } from 'src/types/models';
import { queryLengthChecker } from 'src/utils';

@Injectable()
export class ReturnService {
    constructor() {}

    async getReturnList(query: Query<ReturnSchemaType>): Promise<ReturnSchemaType[]> {
        const { _id, bookId, borrower, approvedBy } = query

        queryLengthChecker(query)

        if (_id) {
            return await ReturnSchema.find({_id}).limit(1).exec()
        }

        if (bookId) {
            return await ReturnSchema.find({bookId}).limit(20).exec()
        }
        
        if (borrower) {
            return await ReturnSchema.find({borrower}).limit(20).exec()
        }

        if (approvedBy) {
            return await ReturnSchema.find({approvedBy}).limit(1).exec()
        }

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
