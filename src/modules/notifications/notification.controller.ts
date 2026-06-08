import prisma from '../../config/db';
import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

const p = prisma as any;

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = Math.min(parseInt((req.query.limit as string) || '20'), 50);
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    p.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    p.notification.count({ where: { userId: req.user!.id } }),
  ]);

  res.json(
    new ApiResponse(200, {
      notifications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }),
  );
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await p.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { read: true },
  });
  res.json(new ApiResponse(200, null, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await p.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  res.json(new ApiResponse(200, null, 'All notifications marked as read'));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await p.notification.count({
    where: { userId: req.user!.id, read: false },
  });
  res.json(new ApiResponse(200, { count }));
});
