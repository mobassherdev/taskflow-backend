import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import { uploadFile, uploadMiddleware } from './upload.controller';

const router: ReturnType<typeof Router> = Router();
router.use(authenticate);

router.post('/', uploadMiddleware, uploadFile);

export default router;
