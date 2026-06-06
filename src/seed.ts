import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: 'Admin User',
    email: process.env.DEMO_ADMIN_EMAIL || 'admin@taskflow.dev',
    password: process.env.DEMO_ADMIN_PASSWORD || 'demo1234',
    role: Role.ADMIN,
  },
  {
    name: 'Project Manager',
    email: 'manager@taskflow.dev',
    password: 'demo1234',
    role: Role.PROJECT_MANAGER,
  },
  {
    name: 'Team Member',
    email: 'member@taskflow.dev',
    password: 'demo1234',
    role: Role.TEAM_MEMBER,
  },
];

async function main() {
  for (const demo of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });
    if (existing) {
      console.log(`ℹ️  User already exists, skipping: ${demo.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(demo.password, 12);
    await prisma.user.create({
      data: {
        name: demo.name,
        email: demo.email,
        password: hashed,
        role: demo.role,
      },
    });
    console.log(`✅ Demo user created: ${demo.email} (${demo.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
