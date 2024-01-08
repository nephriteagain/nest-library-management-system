import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {  BorrowArgs, BorrowSchemaType, Query } from 'src/types/models';
import BorrowSchema from 'src/db/schemas/borrow.schema';
import { ObjectId } from 'mongoose';

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
        
        let queryLength = 0;
        for (const v of Object.values(query)){
            if (v !== undefined) queryLength++
        }
        if (queryLength > 1) {
            throw new HttpException('only one query param allowed!', HttpStatus.BAD_REQUEST)
        }

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
