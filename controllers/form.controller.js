import { Form } from "../models/Form.js";
import { User } from "../models/User.js";

const isEligible = (plan) => ["pro", "premium"].includes(plan);

// Create a form
export const createForm = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!isEligible(user.plan)) {
    return res.status(403).json({ message: "Only Pro and Premium users can create forms" });
  }

  const existingForms = await Form.countDocuments({ userId: user._id });
  if (existingForms >= 10) {
    return res.status(403).json({ message: "Maximum 10 forms allowed" });
  }

  const { title, fields } = req.body;
  const form = new Form({ userId: user._id, title, fields });
  await form.save();

  res.json({ message: "Form created", form });
};

// List user's forms
export const getMyForms = async (req, res) => {
  const forms = await Form.find({ userId: req.user.id });
  res.json(forms);
};

//client get all forms 

export const getAllForms = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allForms = await Form.find({ userId: user._id });
    return res.status(200).json(allForms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};



// Delete a form
export const deleteForm = async (req, res) => {
  const form = await Form.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!form) return res.status(404).json({ message: "Form not found" });
  res.json({ message: "Form deleted" });
};

export const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};