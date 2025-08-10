import express from "express";
import { submitForm, getFormResponses,deleteFormResponse } from "../controllers/formResponse.controller.js";
import { authMiddleware } from "../middlewares/auth.js";


const router = express.Router();

router.post("/submit/:formId", submitForm);
router.get("/responses/:formId",authMiddleware, getFormResponses);
router.delete('/:formId', authMiddleware, deleteFormResponse);


export default router;
