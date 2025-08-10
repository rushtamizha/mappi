import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['wallet', 'plan'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium', null],
    default: null
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referrerCommission: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
