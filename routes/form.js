import express from "express";
import { createForm, getMyForms, deleteForm,getFormById, getAllForms } from "../controllers/form.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.post("/create", authMiddleware, createForm);
router.get("/my", authMiddleware, getMyForms);
router.delete("/delete/:id", authMiddleware, deleteForm);
router.get('/:formId', getFormById);
router.get('/forms/:username',getAllForms)
export default router;
