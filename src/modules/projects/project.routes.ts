import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import {
    addMember,
    createProject,
    deleteProject,
    getProject,
    getProjects,
    removeMember,
    updateProject,
} from './project.controller';
import {
    addMemberSchema,
    createProjectSchema,
    updateProjectSchema,
} from './project.schema';

const router : Router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), validate(createProjectSchema), createProject);
router.get('/:id', getProject);
router.patch('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), validate(updateProjectSchema), updateProject);
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteProject);
router.post('/:id/members', authorize('ADMIN', 'PROJECT_MANAGER'), validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authorize('ADMIN', 'PROJECT_MANAGER'), removeMember);

export default router;
