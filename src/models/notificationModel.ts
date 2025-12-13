import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userSend: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userRecive: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
        type: String,
        enum: ["Like", "Comment"],
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);


export default mongoose.model("Notification", notificationSchema);
