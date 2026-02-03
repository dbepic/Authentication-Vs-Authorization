import jwt from 'jsonwebtoken';
import logger from '../Util/logger.js';
import "dotenv/config.js";
import { StatusCodes } from 'http-status-codes';
import prisma from '../Config/db.js';

const AccessToken = async (userId) => {
    try {
        const token = jwt.sign({ id: userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )
        return token;
    } catch (error) {
        logger.error(`internal server error`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "internal server error",
            success: false
        })
    }
}

const RefreshToken = async (userId) => {
    try {
        const token = jwt.sign({ id: userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )
        const updateToken = await prisma.user.update({
            where: { id: userId },
            data: {
                refresh_token: token
            }
        })
        return token;
    } catch (error) {
        logger.error(`internal server error`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "internal server error",
            success: false
        })
    }
}


const Authorization = async (req, res, next) => {
    try {
        const token = req.cookies.accesstoken || req.headers?.authorization.split(",");
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized",
                success: false
            })
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized",
                success: false
            })
        }
        req.userId = decoded.id;
        next();
    } catch (error) {
        logger.error(`internal server error`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "internal server error",
            success: false
        })
    }
}

export { AccessToken, RefreshToken, Authorization }