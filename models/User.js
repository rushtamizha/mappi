import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,required: true,unique: true,trim: true
  },
   googleId: { type: String },
  gmail: {type: String,required: true },
  password: String,
  bio: String,
  plan: {
  type: String,
  enum: ['free', 'pro', 'premium'],
  default: 'free'
},
  profilePic: { type: String, default: '' },
  referralCode: String,
 referredBy:{type: String},
verified: { type: Boolean, default: false },
  wallet: { type: Number, default: 0 },
  role: { type: String, default: "user" }
});

export const User = mongoose.model("User", userSchema);
