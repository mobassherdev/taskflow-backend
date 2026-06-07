import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { deleteUser, getUser, getUsers, updateUser } from './user.controller';
import { updateUserSchema } from './user.schema';

const router: Router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'PROJECT_MANAGER'), getUsers);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteUser);

export default router;
