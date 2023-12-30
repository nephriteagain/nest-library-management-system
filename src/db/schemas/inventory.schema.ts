import * as mongoose from 'mongoose';

const INVENTORY = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    available: {
        type: Number,
        required: true,
    },
    borrowed: {
        type: Number,
        required: true,
    },
});

export default mongoose.model('INVENTORY', INVENTORY);
