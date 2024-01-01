import * as mongoose from 'mongoose';

const BorrowSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,        
    },
    title: {
        type: String,
        required: true,
    },
    borrower: {
        type: mongoose.SchemaTypes.ObjectId,
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
