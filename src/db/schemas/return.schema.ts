import { Schema, SchemaTypes, model } from 'mongoose';
import { ReturnSchemaType } from 'src/types/models';

const ReturnSchema = new Schema<ReturnSchemaType>({
    bookId: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    borrower: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    returnDate: {
        type: SchemaTypes.Number,
        default: Date.now(),
    },
    borrowDate: {
        type: SchemaTypes.Number,
        required: true,
    },
    approvedBy: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
});

export default model('RETURN', ReturnSchema);
