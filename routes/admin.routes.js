import express from "express";
import {
  getUsers,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/withdrawals", getWithdrawals);
router.post("/withdrawals/approve/:id", approveWithdrawal);
router.post("/withdrawals/reject/:id", rejectWithdrawal);

export default router;
