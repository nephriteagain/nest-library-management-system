import { Schema, SchemaTypes, model } from 'mongoose';
import { PenaltySchemaType } from 'src/types/models';

const PenaltySchema = new Schema<PenaltySchemaType>({
    bookId: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    borrower: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    penalty: {
        type: Number,
        required: true,
    },
    approvedBy: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
});

export default model('PENALTY', PenaltySchema);
