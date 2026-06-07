import { Request, Response } from 'express';
import { activityService } from './activity.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const activities = await activityService.getRecent(req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, activities));
});
