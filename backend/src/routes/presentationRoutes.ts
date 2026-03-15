import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkLimits, checkSlideCountLimit } from '../middleware/limitMiddleware';
import {
  createPresentation,
  getUserPresentations,
  getPresentationById,
  updatePresentation,
  generateSingleSlide,
  deletePresentation,
} from '../controllers/presentationController';
import { exportToPptx } from '../controllers/exportController';

const router = Router();

router.use(authenticate); // Protect all presentation routes

router.post('/', checkLimits, checkSlideCountLimit, createPresentation);
router.post('/generate-slide', checkLimits, generateSingleSlide);
router.get('/', getUserPresentations);
router.get('/:id', getPresentationById);
router.put('/:id', updatePresentation);
router.delete('/:id', deletePresentation);
router.get('/:id/export/pptx', exportToPptx);

export default router;
