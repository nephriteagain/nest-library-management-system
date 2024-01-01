import * as mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
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

export default mongoose.model('EMPLOYEE', EmployeeSchema);
