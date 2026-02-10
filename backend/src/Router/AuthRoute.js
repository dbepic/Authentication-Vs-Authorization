import express from "express";
const authRoute = express.Router();
import passport from "passport";
import { AccessToken } from '../Middleware/generateToken.js';

authRoute.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRoute.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const user = req.user;
        const token = await AccessToken(user.id);
        res.cookie('accesstoken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: "15m"
        });
        res.redirect(`${process.env.CLIENT_URL}/successtoken?${token}`);
    } catch (error) {
        logger.error(`Error in Google callback: ${error.message}`);
        res.redirect('/login');
    }
});

export default authRoute