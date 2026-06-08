import prisma from "../../config/db";

export class AnalyticsService {
  async getDashboard(userId: string, userRole?: string) {
    const now = new Date();
    const isAdmin = userRole === 'ADMIN';

    // Admins see all projects; non-admins only see projects they're a member of
    const projectFilter = isAdmin
      ? {}
      : {
          projectId: {
            in: await prisma.projectMember
              .findMany({ where: { userId }, select: { projectId: true } })
              .then(rows => rows.map(r => r.projectId)),
          },
        };

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      recentActivities,
      tasksByPriority,
      tasksByStatus,
      memberWorkload,
    ] = await Promise.all([
      prisma.project.count({ where: isAdmin ? {} : { id: projectFilter.projectId } }),

      prisma.task.count({ where: projectFilter }),

      prisma.task.count({
        where: { ...projectFilter, status: 'COMPLETED' },
      }),

      prisma.task.count({
        where: {
          ...projectFilter,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      }),

      prisma.activityLog.findMany({
        where: isAdmin ? {} : { projectId: projectFilter.projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { actor: { select: { id: true, name: true, avatar: true } } },
      }),

      prisma.task.groupBy({
        by: ['priority'],
        where: projectFilter,
        _count: { _all: true },
      }),

      prisma.task.groupBy({
        by: ['status'],
        where: projectFilter,
        _count: { _all: true },
      }),

      prisma.task.groupBy({
        by: ['assigneeId'],
        where: {
          ...projectFilter,
          assigneeId: { not: null },
        },
        _count: { _all: true },
      }),
    ]);

    // Enrich workload with user names
    const assigneeIds = memberWorkload.map(m => m.assigneeId!).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true, name: true, avatar: true },
    });

    const completedPerMember = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        ...projectFilter,
        assigneeId: { in: assigneeIds },
        status: 'COMPLETED',
      },
      _count: { _all: true },
    });

    const workloadSummary = memberWorkload.map(entry => {
      const user = users.find(u => u.id === entry.assigneeId);
      const completedCount = completedPerMember.find(
        c => c.assigneeId === entry.assigneeId,
      )?._count._all ?? 0;
      return {
        user,
        total: entry._count._all,
        completed: completedCount,
        pending: entry._count._all - completedCount,
      };
    });

    return {
      kpis: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        overdueTasks,
      },
      tasksByPriority,
      tasksByStatus,
      workloadSummary,
      recentActivities,
    };
  }

  async getProjectProgress(projectId: string) {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: { status: true, dueDate: true, priority: true },
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, percentage };
  }
}

export const analyticsService = new AnalyticsService();
