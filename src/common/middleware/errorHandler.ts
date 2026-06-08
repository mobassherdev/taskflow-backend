import { Prisma } from '../../generated/prisma';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Duplicate entry detected' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};
