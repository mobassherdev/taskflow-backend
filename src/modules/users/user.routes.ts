import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './user.schema';
import { getUsers, getUser, updateUser, deleteUser } from './user.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
