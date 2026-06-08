import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { userService } from './user.service';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.findAll(req.query as any);
  res.json(new ApiResponse(200, result));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findById(req.params.id);
  res.json(new ApiResponse(200, user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id, req.body);
  res.json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(req.params.id);
  res.json(new ApiResponse(200, null, 'User deleted successfully'));
});
