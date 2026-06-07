import prisma from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { z } from 'zod';
import { updateUserSchema, userQuerySchema } from './user.schema';

export class UserService {
  async findAll(query: z.infer<typeof userQuerySchema>) {
    const { page, limit, skip, orderBy } = parsePagination(query);

    const where = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.role && { role: query.role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, pagination: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async update(id: string, dto: z.infer<typeof updateUserSchema>) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, 'User not found');

    return prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, 'User not found');

    await prisma.$transaction(async (tx) => {
      // Delete records with required relations that lack cascade
      await tx.activityLog.deleteMany({ where: { actorId: id } });
      await tx.comment.deleteMany({ where: { authorId: id } });

      // Find a fallback user to reassign ownership
      const fallbackOwner = await tx.user.findFirst({
        where: { id: { not: id } },
        select: { id: true },
      });
      const reassignTo = fallbackOwner?.id ?? id;

      // Reassign tasks where user is creator
      await tx.task.updateMany({
        where: { creatorId: id },
        data: { creatorId: reassignTo },
      });

      // Reassign project ownership
      await tx.project.updateMany({
        where: { ownerId: id },
        data: { ownerId: reassignTo },
      });

      // Delete user (cascades: ProjectMember, Notification, assigned Tasks)
      await tx.user.delete({ where: { id } });
    });
  }
}

export const userService = new UserService();
