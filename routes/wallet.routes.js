import express from "express";
import {
  getWalletBalance,
  requestWithdrawal,
} from "../controllers/wallet.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:userId", getWalletBalance);
router.post("/withdraw" , authMiddleware, requestWithdrawal);

export default router;
