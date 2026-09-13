import express from "express";
import User from "../models/user.js";
import { createTokenForUser } from "../services/authentication.js";
import { checkForAuthenticationCookie } from "../middlewares/authentication.js";
import multer from "multer";
import Blog from "../models/blog.js";
import comments from "../models/comment.js";

const blogroutes = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./public/uploads/`); // Specify the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName); // Specify the filename for the uploaded file
    }
})

const upload = multer({ storage: storage })

blogroutes.get('/add-new', checkForAuthenticationCookie('token'), (req, res) => {
    console.log(req.user)
    return res.render('addBlog', {
        user: req.user
    })
})

blogroutes.post('/add-new', upload.single('file'), checkForAuthenticationCookie('token'), async (req, res) => {

    console.log("req:", req);
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("req.user:", req.user);

    const { title, body } = req.body;
    // Ensure authenticated user is present
    const createdBy = req.user && (req.user.id || req.user._id);
    if (!createdBy) return res.status(401).send('Unauthorized: missing user');

    // Build payload for Blog model
    const payload = {
        title,
        content: body,
        createdBy
    };

    if (req.file && req.file.filename) {
        payload.coverImageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const created = await Blog.create(payload);
        console.log('Created blog:', created._id);
        // redirect after successful POST (use 303 to indicate GET on redirect)
        return res.redirect(303, '/');
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).send(error.message || 'Internal Server Error');
    }
});

blogroutes.get('/:id', checkForAuthenticationCookie('token'), async (req, res) => {
    const id = req.params.id;
    console.log('view blog id:', id);

    try {
        const viewBlog = await Blog.findById(id).populate('createdBy', 'fullname');
        console.log("viewBlog", viewBlog);
        console.log("viewBlog created by", viewBlog.createdBy);
        
        if (!viewBlog) return res.status(404).send('Blog id invalid');
        // load comments for this blog
        const commentsList = await comments.find({ blogId: id }).populate('createdBy', 'fullname').sort({ createdAt: 1 });

        // Render the blog page
        return res.render('blog', { user: req.user, blog: viewBlog, comments: commentsList });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

});

blogroutes.post('/comment/:blogId', checkForAuthenticationCookie('token'),  async (req, res) => {
    try {
        console.log("reqq", req);
        console.log("req.user--", req.user);
        
        if (!req.user) return res.status(401).send('Unauthorized');

        const comment = await comments.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id
        });

        return res.redirect(`/blogs/${req.params.blogId}`);
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).send(error.message || 'Internal Server Error');
    }
});

export default blogroutes;
