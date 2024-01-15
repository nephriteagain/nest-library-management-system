import { SchemaTypes, model, Schema } from 'mongoose';
import { MemberSchemaType } from '../../types/models';

const MemberSchema = new Schema<MemberSchemaType>({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    joinDate: {
        type: Number,
        default: Date.now(),
    },
    approvedBy: {
        type: SchemaTypes.ObjectId,
        required: true,
    },
});

export default model('MEMBERS', MemberSchema);
