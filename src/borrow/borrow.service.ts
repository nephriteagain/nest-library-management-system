import { Injectable } from '@nestjs/common';
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

    async getBorrowList(): Promise<BorrowSchemaType[]> {
        return await BorrowSchema.find({}).limit(20);
    }
}
