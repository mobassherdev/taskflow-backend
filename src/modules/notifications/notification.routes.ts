import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
} from './notification.controller';

const router : Router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
