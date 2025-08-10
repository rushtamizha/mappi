import { FormResponse } from "../models/FormResponse.js";
import { Form } from "../models/Form.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // or use memoryStorage / cloud

// Viewer submits a form
export const submitForm = [
  upload.any(),
  async (req, res) => {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: "Form not found" });

    let responses = {};

    // Collect text fields
    for (const field in req.body) {
      responses[field] = req.body[field];
    }

    // Collect file uploads
    for (const file of req.files) {
      responses[file.fieldname] = file.path; // Adjust if you want to store public URL
    }

    const response = new FormResponse({
      formId,
      responses // ✅ use combined responses object
    });

    await response.save();
    res.json({ message: "Form submitted" });
  }
];
// Get responses (user only)
export const getFormResponses = async (req, res) => {
  const formId = req.params.formId;
  const responses = await FormResponse.find({ formId });
  res.json(responses);
};

export const deleteFormResponse = async (req, res) => {
  try {
    const { formId } = req.params;

    const deleted = await FormResponse.findByIdAndDelete(formId);
    if (!deleted) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.status(200).json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};