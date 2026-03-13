import { Router } from 'express';
import { authenticate } from '../middleware/auth';
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

router.post('/', createPresentation);
router.post('/generate-slide', generateSingleSlide);
router.get('/', getUserPresentations);
router.get('/:id', getPresentationById);
router.put('/:id', updatePresentation);
router.delete('/:id', deletePresentation);

export default router;
