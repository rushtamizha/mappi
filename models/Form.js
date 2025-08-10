import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  label: String,
  type: { type: String, enum: [ "text",
      "email",
      "number",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "file",
      "image"], default: "text" }, options: [String]
});

const formSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  fields: [fieldSchema], // dynamic fields
  createdAt: { type: Date, default: Date.now }
});

export const Form = mongoose.model("Form", formSchema);
