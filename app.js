import express from 'express';
import dotenv from 'dotenv';
import userroutes from './routes/user.js';
import blogroutes from './routes/blogs.js';
import Blog from './models/blog.js';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { validateToken } from './services/authentication.js';

dotenv.config();


const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Populate `res.locals.user` from JWT token (if present)
app.use((req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) return next();
    const payload = validateToken(token);
    if (payload) res.locals.user = payload;
    return next();
});

const PORT = process.env.PORT || 8000;

const mongoConnection = globalThis.__mongoConnection || { promise: null };
globalThis.__mongoConnection = mongoConnection;

async function connectToMongoDB() {
    if (mongoose.connection.readyState === 1) return;

    if (!mongoConnection.promise) {
        mongoConnection.promise = mongoose.connect(process.env.MONGO_URL)
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => {
                mongoConnection.promise = null;
                throw error;
            });
    }

    await mongoConnection.promise;
}

app.use(async (req, res, next) => {
    try {
        await connectToMongoDB();
        next();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        res.status(503).send('Database unavailable');
    }
});

app.get('/', async (req, res) => {
    try {
        const allBlogs = await Blog.find({}).populate('createdBy', 'fullname').sort({ createdAt: -1 });
        return res.render('home', { user: res.locals.user, blgs: allBlogs });
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
});

app.use('/user', userroutes);
app.use('/blogs', blogroutes);

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;