import prisma from "../../config/db";

interface LogPayload {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  description: string;
  actorId: string;
  projectId?: string;
}

export async function logActivity(payload: LogPayload) {
  // Fire-and-forget — never awaited in request handlers
  prisma.activityLog.create({ data: payload }).catch(() => {});
}
