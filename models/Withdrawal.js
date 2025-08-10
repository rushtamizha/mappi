import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  method: String, // e.g., "UPI", "Bank", "Crypto"
  accountInfo: String,
  amount: Number,
  status: { type: String, default: "pending" } // pending | approved | rejected
});

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
