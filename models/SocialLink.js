// models/SocialLink.js
import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const SocialLinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  socialLinks: [socialSchema],
}, { timestamps: true });

export const SocialLink =  mongoose.model('SocialLink', SocialLinkSchema);
