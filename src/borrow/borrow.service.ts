import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BorrowArgs, BorrowSchemaType, Query } from '../types/models';
import BorrowSchema from '../db/schemas/borrow.schema';
import InventorySchema from '../db/schemas/inventory.schema';
import { ObjectId, startSession } from 'mongoose';
import { queryLengthChecker } from '../utils';

@Injectable()
export class BorrowService {
    async add(
        newBorrowData: BorrowArgs,
        employeeId: ObjectId,
    ): Promise<BorrowSchemaType> {
        let session = null;
        try {
            const borrowSession = await startSession();
            session = borrowSession;
            borrowSession.startTransaction();
            const book = await InventorySchema.findById(newBorrowData.bookId);
            if (!book) {
                throw new HttpException('missing book', HttpStatus.NOT_FOUND);
            }
            if (book && book.available < 1) {
                throw new HttpException(
                    'no more available books!',
                    HttpStatus.BAD_REQUEST,
                );
            }
           
            const borrow = await BorrowSchema.create({
                ...newBorrowData,
                title: book.title,
                approvedBy: employeeId,
            });
            await InventorySchema.findByIdAndUpdate(newBorrowData.bookId, {
                $inc: {
                    borrowed: 1,
                    available: -1,
                },
            });
            await borrowSession.commitTransaction();
            console.log('borrow transaction complete!');
            return borrow
        } catch (error) {
            console.error('transaction failed', error);
            if (session) {
                session.abortTransaction();
                session.endSession();
                throw new BadRequestException()
            }
        }
        throw new BadRequestException()
    }


    async getBorrowData(id: ObjectId): Promise<BorrowSchemaType | null> {
        return await BorrowSchema.findById(id);
    }

    // TODO : add schema validation here
    async getBorrowList(
        query: Query<BorrowSchemaType>,
    ): Promise<BorrowSchemaType[]> {
        const { title, _id, bookId, borrower, approvedBy } = query;

        queryLengthChecker(query);

        if (approvedBy) {
            return await BorrowSchema.find({ approvedBy }).limit(20).exec();
        }

        if (_id) {
            return await BorrowSchema.find({ _id }).limit(1).exec();
        }

        if (bookId) {
            return await BorrowSchema.find({ bookId }).limit(20).exec();
        }

        if (borrower) {
            return await BorrowSchema.find({ borrower }).limit(20).exec();
        }

        if (title) {
            const regex = new RegExp(`${title}`, 'gi');
            return await BorrowSchema.find({
                title: {
                    $regex: regex,
                },
            })
                .limit(20)
                .exec();
        }

        return await BorrowSchema.find({}).limit(20).exec();
    }
}
