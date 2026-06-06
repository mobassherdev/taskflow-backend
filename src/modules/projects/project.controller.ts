import { Request, Response } from 'express';
import { projectService } from './project.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.create(req.body, req.user!.id);
  res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.findAll(req.query as any, req.user!.id);
  res.json(new ApiResponse(200, result));
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.findById(req.params.id, req.user!.id);
  res.json(new ApiResponse(200, project));
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.update(req.params.id, req.body, req.user!.id);
  res.json(new ApiResponse(200, project, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.delete(req.params.id, req.user!.id);
  res.json(new ApiResponse(200, null, 'Project deleted successfully'));
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await projectService.addMember(req.params.id, req.body.userId, req.user!.id);
  res.status(201).json(new ApiResponse(201, member, 'Member added successfully'));
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await projectService.removeMember(req.params.id, req.params.userId, req.user!.id);
  res.json(new ApiResponse(200, null, 'Member removed successfully'));
});
