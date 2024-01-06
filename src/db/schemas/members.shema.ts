import { SchemaTypes, model, Schema } from 'mongoose';
import { MemberSchemaType } from 'src/types/models';

const MemberSchema = new Schema<MemberSchemaType>({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
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
