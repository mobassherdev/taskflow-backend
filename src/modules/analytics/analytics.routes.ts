import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import { getDashboard, getProjectProgress } from './analytics.controller';

const router : Router = Router();
router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/projects/:id/progress', getProjectProgress);

export default router;
