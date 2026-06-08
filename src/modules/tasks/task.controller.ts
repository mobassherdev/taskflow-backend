import prisma from '../../config/db';
import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { taskService } from './task.service';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create(req.params.projectId, req.body, req.user!.id, req.user!.role);
  res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

export const getTasksByProject = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.findByProject(req.params.projectId, req.query as any, req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, result));
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.findById(req.params.id);
  res.json(new ApiResponse(200, task));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(req.params.id, req.body, req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, task, 'Task updated successfully'));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.delete(req.params.id, req.user!.id, req.user!.role);
  res.json(new ApiResponse(200, null, 'Task deleted successfully'));
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await taskService.addComment(req.params.id, req.body.body, req.user!.id, req.user!.role);
  res.status(201).json(new ApiResponse(201, comment, 'Comment added successfully'));
});

export const uploadAttachment = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  const { v2: cloudinary } = await import('cloudinary');
  const b64 = file.buffer.toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    folder: 'taskflow/attachments',
  });

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.originalname,
      url: result.secure_url,
      mimeType: file.mimetype,
      size: file.size,
      taskId: req.params.id,
    },
  });

  res.status(201).json(new ApiResponse(201, attachment, 'File uploaded successfully'));
});

export const getUserTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.findUserTasks(req.user!.id, req.query as any);
  res.json(new ApiResponse(200, result));
});
