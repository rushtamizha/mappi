import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commissionEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Referral = mongoose.model("Referral", referralSchema);
