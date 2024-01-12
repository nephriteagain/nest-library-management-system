import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ReturnSchema from 'src/db/schemas/return.schema';
import BorrowSchema from 'src/db/schemas/borrow.schema';
import InventorySchema from 'src/db/schemas/inventory.schema';
import PenaltySchema from 'src/db/schemas/penalty.schema';
import { ObjectId, startSession } from 'mongoose';
import { Query, ReturnSchemaType } from 'src/types/models';
import { queryLengthChecker } from 'src/utils';
import { envConstants } from 'src/auth/constants';

@Injectable()
export class ReturnService {
    constructor() {}

    async getReturnList(
        query: Query<ReturnSchemaType>,
    ): Promise<ReturnSchemaType[]> {
        const { _id, bookId, borrower, approvedBy } = query;

        queryLengthChecker(query);

        if (_id) {
            return await ReturnSchema.find({ _id }).limit(1).exec();
        }

        if (bookId) {
            return await ReturnSchema.find({ bookId }).limit(20).exec();
        }

        if (borrower) {
            return await ReturnSchema.find({ borrower }).limit(20).exec();
        }

        if (approvedBy) {
            return await ReturnSchema.find({ approvedBy }).limit(1).exec();
        }

        return ReturnSchema.find({}).sort('desc').limit(20);
    }

    async getReturnItem(returnId: ObjectId): Promise<ReturnSchemaType | null> {
        return ReturnSchema.findById(returnId);
    }

    async addEntry(_id: ObjectId, approvedBy: ObjectId): Promise<boolean> {
        let session = null;
        try {
            let returnSession = await startSession();
            session = returnSession;
            returnSession.startTransaction();
            // get the borrow data
            const borrowData = await BorrowSchema.findById(_id);
            if (!borrowData) {
                throw new HttpException(
                    'borrow document not found',
                    HttpStatus.NOT_FOUND,
                );
            }
            const { bookId, borrower, date, promisedReturnDate, title } =
                borrowData;
            const returnDate = Date.now();

            // add a isReturnedFlag to the borrow;
            await BorrowSchema.findByIdAndUpdate(_id, {
                isReturned: true,
            });

            // creates the return record
            await ReturnSchema.create({
                _id,
                approvedBy,
                bookId,
                borrowDate: date,
                borrower,
                title,
            });

            // update the inventory
            const inventoryItem = await InventorySchema.findByIdAndUpdate(
                bookId,
                {
                    $inc: {
                        available: 1,
                        borrowed: -1,
                    },
                },
            );

            if (!inventoryItem) {
                throw new HttpException(
                    'inventory item not found',
                    HttpStatus.NOT_FOUND,
                );
            }
            // the book is returned on time
            if (returnDate <= promisedReturnDate) {
                await returnSession.commitTransaction();
                returnSession.endSession();
                console.log('return transaction complete!');
                return true;
            }

            // the book is not returned on time, create a penalty record
            const oneDay = 86_400_000;
            const difference = returnDate - promisedReturnDate;
            const totalPenalty =
                Math.ceil(difference / oneDay) * envConstants.penalty;
            if (isNaN(totalPenalty)) {
                throw new HttpException(
                    'penalty is NaN',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            await PenaltySchema.create({
                _id,
                bookId,
                title,
                borrower,
                approvedBy,
                penalty: totalPenalty,
            });

            await returnSession.commitTransaction();
            returnSession.endSession();
            console.log('return transaction complete!');
            return true;
        } catch (error) {
            console.error('transaction failed', error);
            if (session) {
                session.abortTransaction();
                session.endSession();
                return false;
            }
        }
        return false;
    }
}
