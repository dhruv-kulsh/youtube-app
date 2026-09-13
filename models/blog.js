import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String,
        default: "/images/default-cover.jpg"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;