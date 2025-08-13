import express from 'express';
import {
  upsertSocialLink,
  deleteSocialLink,
  getMySocialLinks,
} from '../controllers/socialLinksController.js';
import {authMiddleware} from '../middlewares/auth.js';

const router = express.Router();

router.get('/:username', getMySocialLinks);
router.post('/',authMiddleware, upsertSocialLink);
router.delete('/:id',authMiddleware, deleteSocialLink);

export default router;
