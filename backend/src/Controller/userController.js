import prisma from "../Config/db";
import logger from '../Utils/logger.js';
import { StatusCodes } from "http-status-codes";
import getdatauri from '../Service/getdatauri.js';
import cloudinary from '../Config/cloudnary.js'
import { AccessToken, RefreshToken } from "../Middleware/generateToken.js";
import bcrypt from "bcryptjs";

const userController = {
    register: async (req, res) => {
        try {
            const { username, lname, email, role, password } = req.body;
            if (!username || !lname || !email || !role || !password) {
                logger.warn(`All fields are required`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "All fields are required",
                    success: false
                })
            }
            const exitingUser = await prisma.user.findUnique({ where: { email } });
            if (exitingUser) {
                logger.warn(`E-mail is already exits`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "E-mail is already exits",
                    success: false
                })
            }
            const file = req.file;
            let avatarurl = null;
            if (file) {
                const parser = getdatauri(file);
                const cloudResponse = await cloudinary.uploader.upload(parser.content, {
                    folder: "usser-prifle"
                })
                avatarurl = cloudResponse.secure_url;
            }
            const saltround = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, saltround);
            const user = await prisma.user.create({
                data: {
                    username,
                    lname,
                    email,
                    role,
                    password: hashpassword,
                    avatarurl
                }
            })
            logger.info(`succesfully register the user`);
            return res.status(StatusCodes.CREATED).json({
                message: "User register successfully",
                success: true,
                user
            })
        } catch (error) {
            logger.error(`internal server error`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "internal server error",
                success: false
            })
        }
    },
    login: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                logger.warn(`All fields are required`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "All fields are required",
                    success: false
                })
            }
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                logger.warn(`User not found`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User not found",
                    success: false
                })
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                logger.warn(`Invalid credentials`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid credentials",
                    success: false
                })
            }
            if (role !== user.role) {
                logger.warn(`Invalid role`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid role",
                    success: false
                })
            }
            if (user.status !== "active") {
                logger.warn(`User is not active`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User is not active",
                    success: false
                })
            }

            const accessToken = await AccessToken(user.id);
            const refreshToken = await RefreshToken(user.id);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    refresh_token: refreshToken,
                    LastLogin: new Date()
                }
            })
            logger.info(`succesfully login the user`);
            return res.status(StatusCodes.OK).json({
                message: `welcome back ${user.username}`,
                success: true,
                accessToken,
                refreshToken
            })
        } catch (error) {
            logger.error(`internal server error`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "internal server error",
                success: false
            })
        }
    },
    update: async (req, res) => {
        try {
            const { username, lname, bio, skills, education } = req.body;

            const userId = req.user;
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                logger.warn(`User not found`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User not found",
                    success: false
                })
            }
            let resumeurl = null;
            let avatarurl = null;


        } catch (error) {
            logger.error(`internal server error`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "internal server error",
                success: false
            })
        }
    }
}


export default userController;