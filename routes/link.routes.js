import express from "express";
import {
  addLink,
  updateLink,
  getUserStats,
  logClick,
  deleteLink,
  getUserLinks,
  toggleVisibility,getLinksByUsername,
  updateLinkOrder
} from "../controllers/link.controller.js";
import { authMiddleware } from "../middlewares/auth.js"; // ✅ import this
import { upload } from '../middlewares/upload.js'; 
const router = express.Router();

router.post("/add", authMiddleware, upload.single('logo'),addLink);

router.put("/update/:id", authMiddleware,upload.single('logo'), updateLink);

router.delete("/delete/:id", authMiddleware, deleteLink);

router.get("/user/:id", getUserLinks);

router.post("/click/:id", logClick);

router.get("/stats/:userId",authMiddleware, getUserStats);

router.patch("/toggle/:id", authMiddleware, toggleVisibility);

router.get("/username/:username",getLinksByUsername)

// PUT /api/links/reorder
router.put('/reorder', authMiddleware, updateLinkOrder);

export default router;
    