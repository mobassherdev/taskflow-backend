import prisma from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { logActivity } from '../../utils/activityLogger';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { createNotification, createNotificationsForProjectMembers } from '../notifications/notification.service';
import { z } from 'zod';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from './task.schema';

async function assertProjectMember(projectId: string, userId: string, userRole?: string) {
  // Admins have full access to all projects and their tasks
  if (userRole === 'ADMIN') return;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw new ApiError(403, 'You are not a member of this project');
}

export class TaskService {
  async create(projectId: string, dto: z.infer<typeof createTaskSchema>, creatorId: string, creatorRole?: string) {
    await assertProjectMember(projectId, creatorId, creatorRole);

    // Rule: prevent duplicate task titles within the same project
    const duplicate = await prisma.task.findFirst({
      where: { projectId, title: { equals: dto.title, mode: 'insensitive' } },
    });
    if (duplicate) throw new ApiError(409, 'This task already exists in the project');

    // Rule: prevent assigning completed tasks
    if (dto.status === 'COMPLETED' && dto.assigneeId) {
      throw new ApiError(400, 'Completed tasks cannot be reassigned');
    }

    // Rule: prevent assigning to non-project-member (admins can assign anyone)
    if (dto.assigneeId && creatorRole !== 'ADMIN') {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: dto.assigneeId } },
      });
      if (!assigneeMember) throw new ApiError(400, 'Assignee is not a member of this project');
    }

    const task = await prisma.task.create({
      data: { ...dto, projectId, creatorId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    logActivity({
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      entityName: task.title,
      description: `Task "${task.title}" was created`,
      actorId: creatorId,
      projectId,
    });

    if (dto.assigneeId && dto.assigneeId !== creatorId) {
      createNotification({
        userId: dto.assigneeId,
        title: 'Task Assigned',
        message: `You were assigned to task "${task.title}"`,
        type: 'TASK_ASSIGNED',
        entityId: task.id,
        entityType: 'Task',
      });
    }

    return task;
  }

  async findByProject(
    projectId: string,
    query: z.infer<typeof taskQuerySchema>,
    userId: string,
    userRole?: string,
  ) {
    await assertProjectMember(projectId, userId, userRole);

    const { page, limit, skip, orderBy } = parsePagination(query);
    const now = new Date();

    const where = {
      projectId,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.assigneeId && { assigneeId: query.assigneeId }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.deadlineStatus === 'overdue' && {
        dueDate: { lt: now },
        status: { not: 'COMPLETED' as const },
      }),
      ...(query.deadlineStatus === 'upcoming' && {
        dueDate: { gte: now },
        status: { not: 'COMPLETED' as const },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, pagination: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true, email: true } },
        creator: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        },
        attachments: true,
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new ApiError(404, 'Task not found');
    return task;
  }

  async update(id: string, dto: z.infer<typeof updateTaskSchema>, actorId: string, actorRole?: string) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Task not found');

    await assertProjectMember(existing.projectId, actorId, actorRole);

    // Role restriction: TEAM_MEMBER can only update status on their own assigned task
    if (actorRole === 'TEAM_MEMBER') {
      if (existing.assigneeId !== actorId) {
        throw new ApiError(403, 'You can only update tasks assigned to you');
      }
      const allowedKeys = new Set(['status']);
      const forbiddenKeys = Object.keys(dto).filter(k => !allowedKeys.has(k));
      if (forbiddenKeys.length > 0) {
        throw new ApiError(403, 'Team members can only update the task status');
      }
    }

    // Rule: prevent assigning completed tasks
    if (existing.status === 'COMPLETED' && dto.assigneeId) {
      throw new ApiError(400, 'Completed tasks cannot be reassigned');
    }

    // Rule: duplicate title check within same project
    if (dto.title && dto.title !== existing.title) {
      const dup = await prisma.task.findFirst({
        where: {
          projectId: existing.projectId,
          title: { equals: dto.title, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (dup) throw new ApiError(409, 'This task already exists in the project');
    }

    // Rule: past date check
    if (dto.dueDate && new Date(dto.dueDate) <= new Date()) {
      throw new ApiError(400, 'Please select a valid deadline');
    }

    // Rule: prevent assigning to non-project-member
    if (dto.assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: existing.projectId, userId: dto.assigneeId } },
      });
      if (!assigneeMember) throw new ApiError(400, 'Assignee is not a member of this project');
    }

    const task = await prisma.task.update({
      where: { id },
      data: dto,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (dto.status) {
      logActivity({
        action: 'TASK_STATUS_CHANGED',
        entityType: 'Task',
        entityId: task.id,
        entityName: task.title,
        description: `Task "${task.title}" was marked as ${dto.status}`,
        actorId,
        projectId: existing.projectId,
      });

      if (task.assigneeId && task.assigneeId !== actorId) {
        createNotification({
          userId: task.assigneeId,
          title: 'Task Status Updated',
          message: `Task "${task.title}" was marked as ${dto.status}`,
          type: 'TASK_STATUS_CHANGED',
          entityId: task.id,
          entityType: 'Task',
        });
      }
    }

    return task;
  }

  async delete(id: string, actorId: string, actorRole?: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new ApiError(404, 'Task not found');

    await assertProjectMember(task.projectId, actorId, actorRole);

    await prisma.task.delete({ where: { id } });

    logActivity({
      action: 'TASK_DELETED',
      entityType: 'Task',
      entityId: id,
      entityName: task.title,
      description: `Task "${task.title}" was deleted`,
      actorId,
      projectId: task.projectId,
    });
  }

  async addComment(taskId: string, body: string, authorId: string, authorRole?: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');

    await assertProjectMember(task.projectId, authorId, authorRole);

    const comment = await prisma.comment.create({
      data: { body, taskId, authorId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    logActivity({
      action: 'COMMENT_ADDED',
      entityType: 'Task',
      entityId: taskId,
      entityName: task.title,
      description: `Comment added on task "${task.title}"`,
      actorId: authorId,
      projectId: task.projectId,
    });

    return comment;
  }

  async findUserTasks(userId: string, query: z.infer<typeof taskQuerySchema>) {
    const { page, limit, skip, orderBy } = parsePagination(query);
    const now = new Date();

    const where = {
      assigneeId: userId,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.deadlineStatus === 'overdue' && {
        dueDate: { lt: now },
        status: { not: 'COMPLETED' as const },
      }),
      ...(query.deadlineStatus === 'upcoming' && {
        dueDate: { gte: now },
        status: { not: 'COMPLETED' as const },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, pagination: buildPaginationMeta(total, page, limit) };
  }
}

export const taskService = new TaskService();
