import prisma from '../../config/database';

export class ActivityService {
  async getRecent(userId: string, userRole?: string) {
    const isAdmin = userRole === 'ADMIN';

    const where = isAdmin
      ? {}
      : {
          projectId: {
            in: await prisma.projectMember
              .findMany({ where: { userId }, select: { projectId: true } })
              .then(rows => rows.map(r => r.projectId)),
          },
        };

    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return activities;
  }
}

export const activityService = new ActivityService();
