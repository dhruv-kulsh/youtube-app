import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    blogId:{
        type: Schema.Types.ObjectId,
        ref: "Blog",
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {timestamps: true});

const comments = mongoose.model("comment", commentSchema);

export default comments