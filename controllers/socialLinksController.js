import {SocialLink} from '../models/SocialLink.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
// Add or Update a social link
export const upsertSocialLink = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { platform, url } = req.body;

    if (!platform || !url) {
      return res.status(400).json({ message: 'platform and url are required' });
    }

    const id = uuidv4();

    // Find if user already has a SocialLink document
    let userSocial = await SocialLink.findOne({ userId });

    if (!userSocial) {
      // Create new document with first social link
      const newSocial = await SocialLink.create({
        userId,
        socialLinks: [{ id, platform, url }],
      });

      return res.status(201).json({ message: 'Social link created', data: newSocial.socialLinks[0] });
    }

    if (!Array.isArray(userSocial.socialLinks)) {
      userSocial.socialLinks = [];
    }

    
    // Check if platform already exists, update it
    const index = userSocial.socialLinks.findIndex(link => link.platform === platform);

    if (index !== -1) {
      // Update existing
      userSocial.socialLinks[index].url = url;
    } else {
      // Add new
      userSocial.socialLinks.push({ id, platform, url });
    }

    await userSocial.save();

    res.status(200).json({ message: 'Social link saved', socialLinks: userSocial.socialLinks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a social link
export const deleteSocialLink = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const result = await SocialLink.findOneAndUpdate(
      { userId },
      { $pull: { socialLinks: { id } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Social links not found for user' });
    }

    res.status(200).json({ message: 'Social link deleted', socialLinks: result.socialLinks });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all social links
export const getMySocialLinks = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find social links by userId
    const socialLinksDoc = await SocialLink.findOne({ userId: user._id });
    if (!socialLinksDoc) {
      return res.status(200).json([]);
    }

    res.status(200).json(socialLinksDoc.socialLinks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


