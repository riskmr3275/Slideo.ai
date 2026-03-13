import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { uploadPptx, getImportedPpts, convertPptToPresentation } from '../controllers/importController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/', getImportedPpts);
router.post('/', upload.single('file'), uploadPptx);
router.post('/convert/:id', convertPptToPresentation);

export default router;
