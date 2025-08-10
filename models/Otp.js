// models/Otp.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  gmail: String,
  otp: String,
  expiresAt: Date
});

export const Otp = mongoose.model('Otp', otpSchema);
