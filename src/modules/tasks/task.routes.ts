import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema, addCommentSchema } from './task.schema';
import {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  uploadAttachment,
} from './task.controller';
import { uploadMiddleware } from '../upload/upload.controller';

const router = Router({ mergeParams: true }); // mergeParams for /projects/:projectId/tasks
router.use(authenticate);

router.get('/', getTasksByProject);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), validate(createTaskSchema), createTask);
router.get('/:id', getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);   // All members can update; service restricts fields per role
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteTask);
router.post('/:id/comments', validate(addCommentSchema), addComment);
router.post('/:id/attachments', uploadMiddleware, uploadAttachment);

export default router;
