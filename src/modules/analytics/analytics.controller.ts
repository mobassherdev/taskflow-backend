import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await analyticsService.getDashboard(req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, dashboard));
});

export const getProjectProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await analyticsService.getProjectProgress(req.params.id);
  res.json(new ApiResponse(200, progress));
});
