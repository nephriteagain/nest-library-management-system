import * as mongoose from 'mongoose';

const BorrowSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },  
    borrower: {
        type: String,
        required: true
    },
    returnDate: {
        type: mongoose.SchemaTypes.Date,
        default: new Date()
    },
    borrowDate: {
        type: mongoose.SchemaTypes.Date,
        required: true,
    },
    approvedBy: {
        type: String,
        required: true    
    }
    
});

export default mongoose.model('BORROW',BorrowSchema)