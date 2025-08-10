import { User } from "../models/User.js";
import { Withdrawal } from "../models/Withdrawal.js";

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getWithdrawals = async (req, res) => {
  const requests = await Withdrawal.find({ status: "pending" }).populate("userId");
  res.json(requests);
};

export const approveWithdrawal = async (req, res) => {
  await Withdrawal.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Withdrawal approved" });
};

export const rejectWithdrawal = async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  const user = await User.findById(withdrawal.userId);
  user.wallet += withdrawal.amount;
  await user.save();
  await withdrawal.delete();
  res.json({ message: "Withdrawal rejected and refunded" });
};
