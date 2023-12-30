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
    date: {
        type: mongoose.SchemaTypes.Number,
        default: Date.now(),
    },
    promisedReturnDate: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    approvedBy: {
        type: String,
        required: true,
    },
});

export default mongoose.model('BORROW', BorrowSchema);
