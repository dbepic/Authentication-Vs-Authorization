import express from "express";
import { Authorization } from "../Middleware/generateToken.js";
import { AvatarUpload, ResumeUpload } from "../Service/multer.js";
import userController from "../Controller/userController.js"
const userRoute = express();

userRoute.post("/register", AvatarUpload, userController.register);
userRoute.post("/login", userController.login);
userRoute.post("/update", Authorization, ResumeUpload, userController.update);
userRoute.post("/forgotpassword", Authorization, userController.forgotpassword);
userRoute.post("/verifyOtp", Authorization, userController.verifypassword);
userRoute.post("/resetpassword", Authorization, userController.resetpassword);
userRoute.post("/logout", Authorization, userController.logout);

export default userRoute;