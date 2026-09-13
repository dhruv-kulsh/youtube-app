import express from "express";
import User from "../models/user.js";
import { createTokenForUser } from "../services/authentication.js";
import { checkForAuthenticationCookie } from "../middlewares/authentication.js";

const userRoutes = express.Router();

userRoutes.get('/signin', (req, res) => {
    return res.render('signin', { user: res.locals.user });
})

userRoutes.get('/signup', (req, res) => {
    return res.render('signup', { user: res.locals.user });
})

userRoutes.post('/signin', async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).send("Invalid email or password");

        const match = await user.comparePassword(password);
        if (!match) return res.status(401).send("Invalid email or password");
        const token = createTokenForUser(user);
        console.log("Generated Token:", token); // Log the generated token
        // Set cookie as HttpOnly and Secure (set Secure=true in production with HTTPS)
        return res.cookie('token', token, { httpOnly: true }).redirect('/');
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

userRoutes.post('/signup', async (req, res) => {
    const body = req.body;
    const { fullname, email, password } = body;
    try {
        await User.create({ fullname, email, password });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
});


userRoutes.get('/profile', checkForAuthenticationCookie('token'), async (req, res) => {
    try {
        console.log('Authenticated user payload:', req.user); // Log the authenticated user payload
        res.send("Welcome");
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
});


userRoutes.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/');
});

export default userRoutes;