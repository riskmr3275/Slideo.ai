import { Router } from 'express';
import { getTemplates, getTemplateById, useTemplate, updateTemplate } from '../controllers/templateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/use', authenticate, useTemplate);
router.put('/:id', authenticate, updateTemplate);

export default router;
