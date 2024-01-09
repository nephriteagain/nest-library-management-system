import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {  BorrowArgs, BorrowSchemaType, Query } from 'src/types/models';
import BorrowSchema from 'src/db/schemas/borrow.schema';
import { ObjectId } from 'mongoose';
import { queryLengthChecker } from 'src/utils';


@Injectable()
export class BorrowService {
    async add(
        newBorrowData: BorrowArgs,
        employeeId: ObjectId,
    ): Promise<BorrowSchemaType> {
        const borrow = await BorrowSchema.create({
            ...newBorrowData,
            approvedBy: employeeId,
        });
        return borrow;
    }
    async getBorrowData(id: ObjectId): Promise<BorrowSchemaType | null> {
        return await BorrowSchema.findById(id);
    }

    // TODO : add schema validation here
    async getBorrowList(query: Query<BorrowSchemaType>): Promise<BorrowSchemaType[]> {
        const { title, _id, bookId, borrower, approvedBy } = query
        
        queryLengthChecker(query)

        if (approvedBy) {
            return await BorrowSchema.find({approvedBy}).limit(20).exec()
        }

        if (_id) {
            return await BorrowSchema.find({_id}).limit(1).exec()
        }

        if (bookId) {
            return await BorrowSchema.find({bookId}).limit(20).exec()
        }

        if (borrower) {
            return await BorrowSchema.find({borrower}).limit(20).exec()
        }

        if (title) {
            const regex = new RegExp(`${title}`, 'gi')
            return await BorrowSchema.find({
                title: {
                    $regex: regex,
                }
            }).limit(20).exec()
        }
        

        return await BorrowSchema.find({}).limit(20).exec();
    }
}
