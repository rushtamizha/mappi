import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { error } from 'console';

const razorpay = new Razorpay({
 key_id: "rzp_test_xFDzYtD6bWOAd6",
  key_secret: "WuRe1en3DsOeCk2LyfSnos1k"
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;


    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const userId = req.user.id || req.user.userId
    const user = User.findById(userId)

    if(user.wallet + Number( amount) < 300){
      return res.status(400).json({
        error: `❌ Wallet limit is ₹300. Your current balance is ₹${user.wallet}`,
      });
    }

    const options = {
      amount: amount * 100, // amount in paisa
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ error: 'Razorpay order creation failed' });
  }
};


// 2. Verify Payment and Add to Wallet
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!req.user || !req.user.id) {
  return res.status(401).json({ error: 'Unauthorized. User not found.' });
}

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment fields" });
  }
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "WuRe1en3DsOeCk2LyfSnos1k")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const user = await User.findById(req.user.id);
    user.wallet += Number(amount);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'wallet',
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'success'
    });


    res.json({ message: "Wallet recharged successfully", wallet: user.wallet });
  } catch (err) {
    console.log("Match" +  error)
    res.status(500).json({ error: err.message });
  }
};
export const purchasePlan = async (req, res) => {
  try {
    const { plan } = req.body;

    const plans = {
      free: 0,
      pro: 100,
      premium: 250
    };

    if (!plans.hasOwnProperty(plan)) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const amount = plans[plan];
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.plan === plan) {
      return res.status(409).json({ error: `You already have the ${plan} plan` });
    }

    if (user.wallet < amount) {
      return res.status(402).json({ error: "Insufficient wallet balance" });
    }

    let referrer = null;
    let commission = 0;


    // Deduct wallet only if not free
    if (amount > 0) {
      user.wallet -= amount;
      const referrer = await User.findById(user.referredBy);
      console.log("refer : " + referrer)
       if (referrer) {
       const commission = amount * 0.10;
       referrer.wallet += commission;
       await referrer.save();
  }
    }

    await Transaction.create({
  userId: user._id,
  type: 'plan',
  plan,
  amount,
  status: 'success',
  referrer: referrer ? referrer._id : null,
  referrerCommission: commission
});


    user.plan = plan;
    await user.save();

    res.json({
      message: `${plan} plan activated successfully`,
      plan: user.plan,
      wallet: user.wallet
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};
