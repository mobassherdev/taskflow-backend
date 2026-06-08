import { Role } from '../../generated/prisma';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
