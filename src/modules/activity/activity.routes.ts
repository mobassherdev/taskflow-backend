import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getActivities } from './activity.controller';

const router = Router();
router.use(authenticate);

router.get('/', getActivities);

export default router;
