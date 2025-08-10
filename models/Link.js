import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  clickLogs: [{ type: Date }],
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  logo: String,   
  description: String,
});

export const Link = mongoose.model("Link", linkSchema);
