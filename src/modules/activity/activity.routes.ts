import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import { getActivities } from './activity.controller';

const router : Router = Router();
router.use(authenticate);

router.get('/', getActivities);

export default router;
