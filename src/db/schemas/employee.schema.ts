import { Schema, model, } from 'mongoose'
import { EmployeeSchemaType } from 'src/types/models';

const EmployeeSchema = new Schema<EmployeeSchemaType>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
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
});

export default model('EMPLOYEE', EmployeeSchema);
