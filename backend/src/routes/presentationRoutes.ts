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

const router = Router();

router.use(authenticate); // Protect all presentation routes

router.post('/', checkLimits, checkSlideCountLimit, createPresentation);
router.post('/generate-slide', checkLimits, generateSingleSlide);
router.get('/', getUserPresentations);
router.get('/:id', getPresentationById);
router.put('/:id', updatePresentation);
router.delete('/:id', deletePresentation);

export default router;
