import prisma from "../../config/db";

const p = prisma as any;

interface CreateNotification {
  userId: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  entityType?: string;
}

export async function createNotification(data: CreateNotification) {
  try {
    return await p.notification.create({ data });
  } catch {
    // Silently fail — notifications should not block main operations
  }
}

export async function createNotificationsForProjectMembers(
  projectId: string,
  excludeUserId: string,
  data: Omit<CreateNotification, 'userId'>,
) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    await p.notification.createMany({
      data: members.map((m: any) => ({ ...data, userId: m.userId })),
    });
  } catch {
    // Silently fail
  }
}
