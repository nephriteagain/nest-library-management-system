import * as mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
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
    isAdmin: {
        type: Boolean,
    },
});

export default mongoose.model('EMPLOYEE', EmployeeSchema);
