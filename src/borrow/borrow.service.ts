import { Injectable } from '@nestjs/common';
import { Borrow } from 'src/types/models';
import BorrowSchema from 'src/db/schemas/borrow.schema';
import { Document, ObjectId } from 'mongoose';

@Injectable()
export class BorrowService {
    async add(newBorrowData: Borrow, employeeId: ObjectId): Promise<Document> {
        const borrow = await BorrowSchema.create({
            ...newBorrowData,
            approvedBy: employeeId,
        });
        return borrow;
    }
    async getBorrowData(id: ObjectId): Promise<Document | null> {
        return await BorrowSchema.findById(id);
    }

    async getBorrowList(): Promise<Document[]> {
        return await BorrowSchema.find({}).limit(20);
    }
}
