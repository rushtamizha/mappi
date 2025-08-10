import { Referral } from "../models/Referral.js";

export const getUserReferrals = async (req, res) => {
  const referrals = await Referral.find({ referrer: req.params.userId }).populate("referredUser","username gmail plan createdAt").select('-_id,-commissionEarned');
  const cleaned = referrals
      .map(ref => ref.referredUser) // remove referral wrapper
      .filter(Boolean); 
  res.json(cleaned);
};
