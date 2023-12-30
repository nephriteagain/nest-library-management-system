import * as mongoose from 'mongoose';

const BorrowSchema = new mongoose.Schema({
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
        type: String,
        required: true,
    },
});

export default mongoose.model('BORROW', BorrowSchema);
