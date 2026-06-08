import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { activityService } from './activity.service';

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const activities = await activityService.getRecent(req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, activities));
});
