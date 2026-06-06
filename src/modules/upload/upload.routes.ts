import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { uploadMiddleware, uploadFile } from './upload.controller';

const router = Router();
router.use(authenticate);

router.post('/', uploadMiddleware, uploadFile);

export default router;
