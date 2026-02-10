import 'dotenv/config.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, cb) => {
        try {
            const user = await prisma.usertable.findUnique({ where: { googleId: profile.id } });
            if (!user) {
                const newUser = await prisma.usertable.create({
                    data: {
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                    }
                })
                return cb(null, newUser);
            }
            return cb(null, user);
        } catch (error) {
            return cb(error, null);
        }
    }
));