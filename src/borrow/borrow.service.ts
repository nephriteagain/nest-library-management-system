import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BorrowArgs, BorrowSchemaType } from 'src/types/models';
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
    async getBorrowList(query: {title?:string, id: ObjectId; bookId?: ObjectId; borrower: ObjectId}): Promise<BorrowSchemaType[]> {
        const { title, id, bookId } = query

        if (id) {
            return await BorrowSchema.find({_id:id}).limit(20).exec()
        }

        if (bookId) {
            return await BorrowSchema.find({bookId}).limit(1).exec()
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
