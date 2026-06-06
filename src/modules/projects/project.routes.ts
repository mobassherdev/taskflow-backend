import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from './project.schema';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from './project.controller';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), validate(createProjectSchema), createProject);
router.get('/:id', getProject);
router.patch('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), validate(updateProjectSchema), updateProject);
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteProject);
router.post('/:id/members', authorize('ADMIN', 'PROJECT_MANAGER'), validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authorize('ADMIN', 'PROJECT_MANAGER'), removeMember);

export default router;
