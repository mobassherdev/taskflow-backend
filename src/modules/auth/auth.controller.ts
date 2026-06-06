import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Account created successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  res.json(new ApiResponse(200, tokens));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { password: _, ...safeUser } = req.user!;
  res.json(new ApiResponse(200, safeUser));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
