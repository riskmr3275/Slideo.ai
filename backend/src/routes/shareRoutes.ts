import { Router } from 'express';
import { createShareLink, resolveShareToken, getSharedPresentation } from '../controllers/shareController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create a share link (authenticated — only owner can share)
router.post('/:presentationId', authenticate, createShareLink);

// Resolve a share token (public — recipient clicks the link)
router.get('/resolve/:token', resolveShareToken);

// Get presentation data via share token (public)
router.get('/presentation/:id', getSharedPresentation);

export default router;
