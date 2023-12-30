import * as mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },  
    authors: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    yearPublished: {
        type: Number,        
    },
    dateAdded: {
        type: mongoose.SchemaTypes.Number,
        default: Date.now()
    }
    
});

export default mongoose.model('BOOK', BookSchema)