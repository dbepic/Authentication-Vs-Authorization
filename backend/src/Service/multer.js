import multer from "multer";

const storage = multer.memoryStorage();

const AvatarUpload = multer({ storage }).single('avatar');

const ResumeUpload = multer({ storage }).single('resume');


export { AvatarUpload, ResumeUpload }