import * as mongoose from 'mongoose'

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true      
    },
    age: {
        type: String,
        required: true
    },
    joinDate: {
        type: Number,
        default: Date.now()
    },
    approvedBy: {
        type: String,
        required: true
    }

})

export default mongoose.model('MEMBERS',MemberSchema)

