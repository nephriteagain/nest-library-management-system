import { Schema, model, SchemaTypes } from 'mongoose';
import { BorrowSchemaType } from '../../types/models';

const BorrowSchema = new Schema<BorrowSchemaType>({
    bookId: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    borrower: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    date: {
        type: SchemaTypes.Number,
        default: Date.now(),
    },
    promisedReturnDate: {
        type: SchemaTypes.Number,
        required: true,
    },
    approvedBy: {
        type: String,
        required: true,
    },
    isReturned: {
        type: Boolean,
    },
});

export default model('BORROW', BorrowSchema);
