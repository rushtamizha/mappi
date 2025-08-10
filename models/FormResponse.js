import mongoose from "mongoose";

const formResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
  responses: mongoose.Schema.Types.Mixed, // ✅ or use Map / custom array format
  data: Object,
  createdAt: { type: Date, default: Date.now }
});


export const FormResponse = mongoose.model("FormResponse", formResponseSchema);
