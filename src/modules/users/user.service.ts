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
    await prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
