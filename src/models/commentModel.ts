import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type: String,
        required: true
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
},
{
    timestamps: true
}
)

export default mongoose.model("Comment", commentSchema)