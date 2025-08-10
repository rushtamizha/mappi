import { User } from "../models/User.js";
import { Withdrawal } from "../models/Withdrawal.js";


export const getWalletBalance = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ wallet: user.wallet });
};

export const requestWithdrawal = async (req, res) => {
  const {  method, accountInfo, amount } = req.body;
  const userId = req.user.id || req.user.userId
  try {
    const user = await User.findById(userId);
  if (user.wallet < amount) return res.status(400).json({ message: "Insufficient balance" });
  await Withdrawal.create({ userId, method, accountInfo, amount });
  user.wallet -= amount;
  await user.save();
  res.json({ message: "Withdrawal requested" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
