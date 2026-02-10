import jwt from "jsonwebtoken";
import "dotenv/config";
import logger from "../Utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ================= ACCESS TOKEN ================= */
const AccessToken = async (userId) => {
    try {
        return jwt.sign(
            { id: userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
    } catch (error) {
        logger.error(`Error generating access token: ${error.message}`);
        throw error;
    }
};

/* ================= REFRESH TOKEN ================= */
const RefreshToken = async (userId) => {
    try {
        const token = jwt.sign(
            { id: userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" } // ✅ longer life
        );

        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: token
            }
        });

        return token;
    } catch (error) {
        logger.error(`Error generating refresh token: ${error.message}`);
        throw error;
    }
};

/* ================= AUTH MIDDLEWARE ================= */
const Authorization = async (req, res, next) => {
    try {
        const token = req.cookies.accesstoken || req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Access token missing"
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded.id;
        next();
    } catch (error) {
        logger.warn(`Invalid or expired token`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export { AccessToken, RefreshToken, Authorization };
