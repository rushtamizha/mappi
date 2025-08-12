import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Referral } from "../models/Referral.js";
import { Otp } from '../models/Otp.js';
import { sendOTP } from '../utils/sendMail.js';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const checkUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmed = username.trim();

    // Allow only lowercase/uppercase letters, numbers, underscore. No special chars/spaces.
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmed)) {
      return res.status(400).json({success:false, error: 'Username can only contain letters, numbers, and underscores' });
    }

    // Optional: enforce min and max length
    if (trimmed.length < 3 || trimmed.length > 20) {
      return res.status(400).json({success:false, error: 'Username must be between 3 and 20 characters' });
    }

    // Case-insensitive search
    const exists = await User.findOne({ username: { $regex: `^${trimmed}$`, $options: 'i' } });

    if (exists) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const sendRegisterOtp = async (req, res) => {
  try {
    const { gmail } = req.body;

    const existGmail = await User.findOne({gmail})

    if(existGmail){
      res.status(409).json({message:"Gmail id already registered with other user"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await Otp.findOneAndUpdate(
      { gmail },
      { otp, expiresAt },
      { upsert: true }
    );

    await sendOTP(gmail, otp);
    res.json({success:true, message: 'OTP sent to gmail' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const register = async (req, res) => {
  try {
    const { username, gmail, password, referredBy: referralCodeInput, otp } = req.body;

    // 1. Validate OTP
    const otpRecord = await Otp.findOne({ gmail });
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // 2. Clean username (remove spaces, make consistent case)
    const cleanedUsername = username.replace(/\s+/g, '').trim();

    // 3. Check if username already exists (case-insensitive)
    const exists = await User.exists({ username: { $regex: `^${cleanedUsername}$`, $options: 'i' } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    // 4. Hash password
    const hash = await bcrypt.hash(password, 10);

    // 5. Validate referral code
    let referredBy = null;
    if (referralCodeInput) {
      const referrer = await User.findOne({
        referralCode: { $regex: `^${referralCodeInput}$`, $options: 'i' }
      });
      if (referrer) {
        referredBy = referrer._id;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
    }

    // 6. Create referral code (same as cleaned username)
    const referralCode = cleanedUsername;

    // 7. Save user
    const user = new User({
      username: cleanedUsername,
      gmail,
      password: hash,
      referralCode,
      referredBy
    });
    await user.save();

    // 8. Create referral record if applicable
    if (referredBy) {
      await Referral.create({
        referrer: referredBy,
        referredUser: user._id,
        commissionEarned: 0
      });
    }

    // 9. Delete OTP record
    await Otp.deleteOne({ gmail });

    return res.status(200).json({ success: true, message: 'Registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration Failed" });
  }
};


export const registerGoogle = async (req, res) => {
  try {
    const { username, gmail, referredBy: referralCodeInput, googleId } = req.body;

    if (!username || !gmail || !googleId) {
      return res.status(400).json({ msg: 'Username, Gmail, and Google ID are required' });
    }
    const cleanedUsername = username.trim().replace(/\s+/g, '');

    const exists = await User.findOne({ $or: [{ gmail }, { username: { $regex: `^${cleanedUsername}$`, $options: 'i' } }]})
    if (exists) return res.status(400).json({ msg: 'User already exists' });

    let referredBy = null;

   if (referralCodeInput) {
      const referrer = await User.findOne({ referralCode: { $regex: `^${referralCodeInput}$`, $options: 'i' } });
      if (referrer) {
        referredBy = referrer._id;
      } else {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
    }


  const spaceName = username.replace(" ","")
   const referralCode = spaceName;
    const user = new User({ username:spaceName, gmail, referralCode, referredBy });
    await user.save();

    if (referredBy) {
      await Referral.create({ referrer: referredBy, referredUser: user._id, commissionEarned: 0 });
    }

    res.json({ msg: 'Google registration successful' });
  } catch (err) {
    console.error('Google Registration Error:', err.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
};


export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {

    if (!token) {
      return res.status(400).json({ msg: 'Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ msg: 'Invalid Google token' });
    }

    const user = await User.findOne({ gmail: payload.email });

    if (!user) {
      return res.status(404).json({ msg: 'User not registered. Please register first.' });
    }

    const jwtToken = createToken(user._id);
    res.json({ token: jwtToken });
  } catch (err) {
    console.error('Google Login Error:', err.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
};




export const login = async (req, res) => {
  const { gmail, password } = req.body;
  const user = await User.findOne({ gmail });
  if (!user) return res.status(401).json({ message: "User not found" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
};

export const sendForgotOtp = async (req, res) => {
  try {
    const { gmail } = req.body;

    const user = await User.findOne({ gmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await Otp.findOneAndUpdate(
      { gmail },
      { otp, expiresAt },
      { upsert: true }
    );

    await sendOTP(gmail, otp);
    res.json({ message: 'OTP sent to gmail' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const verifyForgotOtp = async (req, res) => {
  try {
    const { gmail, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ gmail });
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ gmail }, { password: hashed });

    await Otp.deleteOne({ gmail });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyAuth = async(req,res)=>{
  try {
    const{gmail,otp}= req.body;
    const otpAuth = await Otp.findOne({gmail});
    if(!otpAuth || otpAuth.otp!==otp){
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    res.json({ success:true, message: 'Otp verified  successfully' })
  } catch (error) {
     res.status(500).json({ message: err.message });
  }
}



export const updateProfilePic = async (req, res) => {
   try {
    const { profilePic, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic, bio },
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
