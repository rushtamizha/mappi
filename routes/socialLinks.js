import express from 'express';
import {
  upsertSocialLink,
  deleteSocialLink,
  getMySocialLinks,
} from '../controllers/socialLinksController.js';
import {authMiddleware} from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:username', getMySocialLinks);
router.post('/', upsertSocialLink);
router.delete('/:id', deleteSocialLink);

export default router;
