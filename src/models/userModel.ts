import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    permissions: {
    type: [String],
    enum: ["admin", "user"],
    default: []
    }
})

export default mongoose.model("User", userSchema)