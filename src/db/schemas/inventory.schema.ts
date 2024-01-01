import { Schema, model,  } from 'mongoose'
import { InventorySchemaType } from 'src/types/models';

const INVENTORY = new Schema<InventorySchemaType>({
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

export default model('INVENTORY', INVENTORY);
