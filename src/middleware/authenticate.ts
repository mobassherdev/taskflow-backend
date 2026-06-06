import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';
import { JwtPayload } from '../types';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new ApiError(401, 'Unauthorized');

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new ApiError(401, 'User no longer exists');
    req.user = user;
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
};
