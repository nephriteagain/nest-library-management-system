import * as mongoose from 'mongoose';
import { ReturnSchemaType } from 'src/types/models';

const ReturnSchema = new mongoose.Schema<ReturnSchemaType>({
    title: {
        type: String,
        required: true,
    },
    borrower: {
        type: String,
        required: true,
    },
    returnDate: {
        type: mongoose.SchemaTypes.Number,
        default: Date.now(),
    },
    borrowDate: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    approvedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
});

export default mongoose.model('RETURN', ReturnSchema);
