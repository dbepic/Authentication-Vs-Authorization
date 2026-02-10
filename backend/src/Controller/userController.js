import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import getdatauri from "../Service/datauri.js";
import cloudinary from "../Config/cloudnary.js";
import logger from "../Utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { AccessToken, RefreshToken } from "../Middleware/generateToken.js";
import generateOtp from "../Utils/generateOtp.js";
import { success } from "zod";

const prisma = new PrismaClient();

const userController = {

    register: async (req, res) => {
        try {
            const { username, email, password, role } = req.body;

            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(StatusCodes.CONFLICT).json({
                    success: false,
                    message: "User already exists"
                });
            }

            let avatar = null;
            if (req.file) {
                const parser = getdatauri(req.file);
                const upload = await cloudinary.uploader.upload(parser.content, {
                    folder: "user-profiles"
                });
                avatar = upload.secure_url;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    avatar,
                    role,
                    // We create the profile record now so it exists for the update method later
                    profile: {
                        create: {}
                    }
                },
                include: {
                    profile: true
                }
            });

            // Remove sensitive data before sending
            const { password: _, ...userWithoutPassword } = user;

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "User created successfully",
                user: userWithoutPassword
            });

        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user || !user.password) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            if (user.status !== "active") {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: "User account is inactive"
                });
            }

            const accessToken = await AccessToken(user.id);
            const refreshToken = await RefreshToken(user.id);

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict", // Changed to strict for better security
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            };

            res.cookie("accesstoken", accessToken, cookieOptions);
            res.cookie("refreshtoken", refreshToken, cookieOptions);

            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });

            const { password: _, ...userResponse } = user;

            return res.status(StatusCodes.OK).json({
                success: true,
                user: userResponse,
                message: `Welcome back ${user.username ?? "User"}`
            });

        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    update: async (req, res) => {
        try {
            const userId = req.user;
            const { username, lname, phone, bio, skills, education } = req.body;

            const userRecord = await prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

            if (!userRecord) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                });
            }

            let resumeUrl = userRecord.profile?.resume;
            if (req.file) {
                const parser = getdatauri(req.file);
                const upload = await cloudinary.uploader.upload(parser.content, {
                    folder: "user-resumes"
                });
                resumeUrl = upload.secure_url;
            }

            // Update both User and Profile in one call
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                    lname,
                    phone,
                    profile: {
                        upsert: {
                            create: {
                                bio,
                                skills: skills ? skills.split(",").map(s => s.trim()) : undefined,
                                education: education ? education.split(",").map(e => e.trim()) : undefined,
                                resume: resumeUrl
                            },
                            update: {
                                bio,
                                skills: skills ? skills.split(",").map(s => s.trim()) : undefined,
                                education: education ? education.split(",").map(e => e.trim()) : undefined,
                                resume: resumeUrl
                            }
                        }
                    }
                },
                include: { profile: true }
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile updated successfully",
                user: updatedUser
            });

        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    forgotpassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                logger.warn(`email is not defined`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Email is required"
                })
            }

            const userId = req.user;
            let user = await prisma.user.findUnique({ where: { userId } });
            if (!user) {
                logger.warn(`userId is not defined`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "User not found"
                })
            }
            const otp = await generateOtp();
            const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.user.create({
                data: {
                    forgotpassword: otp,
                    forgotpasswordExp: expiryTime
                }
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "OTP sent successfully",
                otp
            });

        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    verifypassword: async (req, res) => {
        try {
            const { otp } = req.body;
            if (!otp) {
                logger.warn(`otp is required`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Otp is required",
                    success: false
                })
            }
            const userId = req.user;
            let user = await prisma.user.findUnique({ where: { userId } });
            if (!user) {
                logger.warn(`user not found`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User not found",
                    success: false
                })
            }
            if (user.forgotpassword !== otp) {
                logger.warn(`otp is incorrect`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Otp is incorrect",
                    success: false
                })
            }
            if (user.forgotpasswordExp < new Date()) {
                logger.warn(`otp is expired`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Otp is expired",
                    success: false
                })
            }
            return res.status(StatusCodes.OK).json({
                message: "Otp is verified successfully",
                success: true
            })
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    resetpassword: async (req, res) => {
        try {
            const { password, confirmpassword } = req.body;
            if (!password || !confirmpassword) {
                logger.warn(`all filed must required`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "All field must required",
                    success: false
                })
            }
            if (password !== confirmpassword) {
                logger.warn(`password and confirm password not match`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Password and confirm password not match",
                    success: false
                })
            }
            const userId = req.user;
            let user = await prisma.user.findUnique({ where: { userId } });
            if (!user) {
                logger.warn(`user not found`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User not found",
                    success: false
                })
            }
            const saltrounds = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, saltrounds);
            await prisma.user.update({
                where: { userId },
                data: {
                    password: hashPassword,
                    forgotpassword: null,
                    forgotpasswordExp: null
                }
            })
            return res.status(StatusCodes.OK).json({
                message: "Password reset successfully",
                success: true
            })
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    },
    logout: async (req, res) => {
        try {
            const userId = req.user;
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                logger.warn(`user not found`);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User not found",
                    success: false
                })
            }
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 0
            };

            res.clearCookie("accesstoken", cookieOptions);
            res.clearCookie("refreshtoken", cookieOptions);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    refreshToken: null
                }
            });
            return res.status(StatusCodes.OK).json({
                message: "Logout successfully",
                success: true
            });
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
};

export default userController;