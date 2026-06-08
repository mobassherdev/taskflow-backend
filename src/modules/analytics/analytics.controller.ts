import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { analyticsService } from './analytics.service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await analyticsService.getDashboard(req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, dashboard));
});

export const getProjectProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await analyticsService.getProjectProgress(req.params.id);
  res.json(new ApiResponse(200, progress));
});
