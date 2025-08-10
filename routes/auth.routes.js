import express from "express";
import { register, login,checkUsernameAvailable,sendRegisterOtp,sendForgotOtp,verifyForgotOtp, verifyAuth,registerGoogle,googleLogin,updateProfilePic,getUserProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get(`/check-username/:username`, checkUsernameAvailable);
router.post('/register/send-otp', sendRegisterOtp);
router.post('/register/verify-otp', verifyAuth);

router.post('/forgot-password/send-otp', sendForgotOtp);
router.post('/forgot-password/verify', verifyForgotOtp);

router.post('/register-google', registerGoogle);
router.post('/google-login', googleLogin);
router.put('/update-profile-pic', authMiddleware, updateProfilePic);
router.get('/profile',authMiddleware,getUserProfile)



export default router;
