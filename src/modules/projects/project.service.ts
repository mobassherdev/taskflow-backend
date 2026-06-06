import prisma from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { logActivity } from '../../utils/activityLogger';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { z } from 'zod';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from './project.schema';

export class ProjectService {
  async create(dto: z.infer<typeof createProjectSchema>, userId: string) {
    const project = await prisma.project.create({
      data: {
        ...dto,
        ownerId: userId,
        members: { create: { userId } },
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    logActivity({
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project.id,
      entityName: project.name,
      description: `Project "${project.name}" was created`,
      actorId: userId,
      projectId: project.id,
    });

    return project;
  }

  async findAll(query: z.infer<typeof projectQuerySchema>, userId: string) {
    const { page, limit, skip, orderBy } = parsePagination(query);

    const where = {
      members: { some: { userId } },
      ...(query.status && { status: query.status }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          _count: { select: { tasks: true, members: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, pagination: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, members: { some: { userId } } },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  async update(id: string, dto: z.infer<typeof updateProjectSchema>, userId: string) {
    await this.assertOwnerOrAdmin(id, userId);
    const project = await prisma.project.update({ where: { id }, data: dto });

    logActivity({
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: project.id,
      entityName: project.name,
      description: `Project "${project.name}" was updated`,
      actorId: userId,
      projectId: project.id,
    });

    return project;
  }

  async delete(id: string, userId: string) {
    await this.assertOwnerOrAdmin(id, userId);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new ApiError(404, 'Project not found');

    await prisma.project.delete({ where: { id } });

    logActivity({
      action: 'PROJECT_DELETED',
      entityType: 'Project',
      entityId: id,
      entityName: project.name,
      description: `Project "${project.name}" was deleted`,
      actorId: userId,
    });
  }

  async addMember(projectId: string, memberId: string, actorId: string) {
    await this.assertOwnerOrAdmin(projectId, actorId);

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberId } },
    });
    if (existing) throw new ApiError(409, 'User is already a project member');

    const user = await prisma.user.findUnique({ where: { id: memberId } });
    if (!user) throw new ApiError(404, 'User not found');

    const member = await prisma.projectMember.create({
      data: { projectId, userId: memberId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    logActivity({
      action: 'MEMBER_ADDED',
      entityType: 'Project',
      entityId: projectId,
      entityName: user.name,
      description: `${user.name} was added to the project`,
      actorId,
      projectId,
    });

    return member;
  }

  async removeMember(projectId: string, memberId: string, actorId: string) {
    await this.assertOwnerOrAdmin(projectId, actorId);
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberId } },
    });
  }

  private async assertOwnerOrAdmin(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new ApiError(404, 'Project not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    const isOwner = project.ownerId === userId;
    const isAdmin = user.role === 'ADMIN';
    const isManager = user.role === 'PROJECT_MANAGER';

    if (!isOwner && !isAdmin && !isManager) {
      throw new ApiError(403, 'Only the project owner, managers, or admins can perform this action');
    }
  }
}

export const projectService = new ProjectService();
