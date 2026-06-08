import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ MongoDB connected via Prisma');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
