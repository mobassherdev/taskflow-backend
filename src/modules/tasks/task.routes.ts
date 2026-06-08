import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import { uploadMiddleware } from '../upload/upload.controller';
import {
    addComment,
    createTask,
    deleteTask,
    getTask,
    getTasksByProject,
    updateTask,
    uploadAttachment,
} from './task.controller';
import { addCommentSchema, createTaskSchema, updateTaskSchema } from './task.schema';

const router : Router = Router({ mergeParams: true }); // mergeParams for /projects/:projectId/tasks
router.use(authenticate);

router.get('/', getTasksByProject);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), validate(createTaskSchema), createTask);
router.get('/:id', getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);   // All members can update; service restricts fields per role
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteTask);
router.post('/:id/comments', validate(addCommentSchema), addComment);
router.post('/:id/attachments', uploadMiddleware, uploadAttachment);

export default router;
