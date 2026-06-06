import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from './notification.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
