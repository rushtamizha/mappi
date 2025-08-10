import express from "express";
import { getUserReferrals } from "../controllers/referral.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/user/:userId", authMiddleware,getUserReferrals);

export default router;
