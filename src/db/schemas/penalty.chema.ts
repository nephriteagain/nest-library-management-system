import * as mongoose from 'mongoose';

const PenaltySchema = new mongoose.Schema({
    bookId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    borrower: {
        type: String,
        required: true,
    },
    penalty: {
        type: Number,
        required: true,
    },
    approvedBy: {
        type: String,
        required: true,
    },
});

export default mongoose.model('PENALTY', PenaltySchema);
