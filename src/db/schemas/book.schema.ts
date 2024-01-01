import { Schema, model, SchemaTypes } from 'mongoose';
import { BookSchemaType } from 'src/types/models';

const BookSchema = new Schema<BookSchemaType>({
    title: {
        type: String,
        required: true,
    },
    authors: {
        type: [SchemaTypes.String],
        required: true,
    },
    yearPublished: {
        type: Number,
    },
    dateAdded: {
        type: SchemaTypes.Number,
        default: Date.now(),
    },
});

export default model('BOOK', BookSchema);
