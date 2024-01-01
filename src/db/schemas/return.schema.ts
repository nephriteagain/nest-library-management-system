import { Schema, SchemaTypes, model } from 'mongoose'
import { ReturnSchemaType } from 'src/types/models';

const ReturnSchema = new Schema<ReturnSchemaType>({
    title: {
        type: String,
        required: true,
    },
    borrower: {
        type: String,
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
});

export default model('RETURN', ReturnSchema);
