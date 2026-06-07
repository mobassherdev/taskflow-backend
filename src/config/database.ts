import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Connect to the database
 */
export async function connectDB(): Promise<void> {
  await prisma.$connect();
}

/**
 * Disconnect from the database
 */
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
