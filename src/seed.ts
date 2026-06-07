import { PrismaClient, Role, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  { name: 'Admin User', email: 'admin@taskflow.dev', password: 'demo1234', role: Role.ADMIN },
  { name: 'Sarah Chen', email: 'sarah@taskflow.dev', password: 'demo1234', role: Role.PROJECT_MANAGER },
  { name: 'James Wilson', email: 'james@taskflow.dev', password: 'demo1234', role: Role.PROJECT_MANAGER },
  { name: 'Emily Rodriguez', email: 'emily@taskflow.dev', password: 'demo1234', role: Role.TEAM_MEMBER },
  { name: 'Michael Park', email: 'michael@taskflow.dev', password: 'demo1234', role: Role.TEAM_MEMBER },
  { name: 'Lisa Wang', email: 'lisa@taskflow.dev', password: 'demo1234', role: Role.TEAM_MEMBER },
  { name: 'David Kim', email: 'david@taskflow.dev', password: 'demo1234', role: Role.TEAM_MEMBER },
  { name: 'Anna Thompson', email: 'anna@taskflow.dev', password: 'demo1234', role: Role.TEAM_MEMBER },
];

const PROJECTS = [
  {
    name: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX, improved performance, and new payment integrations.',
    status: ProjectStatus.ACTIVE,
    deadline: new Date('2026-08-15'),
  },
  {
    name: 'Mobile App Development',
    description: 'Build a cross-platform mobile application for iOS and Android using React Native with key features from the web platform.',
    status: ProjectStatus.ACTIVE,
    deadline: new Date('2026-09-30'),
  },
  {
    name: 'API Gateway Migration',
    description: 'Migrate the legacy REST API to a new GraphQL gateway with improved documentation and rate limiting.',
    status: ProjectStatus.ON_HOLD,
    deadline: new Date('2026-07-01'),
  },
  {
    name: 'Customer Analytics Dashboard',
    description: 'Real-time analytics dashboard showing customer behavior, sales metrics, and conversion funnels.',
    status: ProjectStatus.ACTIVE,
    deadline: new Date('2026-10-15'),
  },
  {
    name: 'Security Audit & Compliance',
    description: 'Comprehensive security audit and implementation of GDPR/SOC2 compliance measures.',
    status: ProjectStatus.COMPLETED,
    deadline: new Date('2026-04-30'),
  },
];

const TASKS_BY_PROJECT: Record<string, { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDateOffset: number }[]> = {
  'E-Commerce Platform Redesign': [
    { title: 'Design new product listing page', description: 'Create wireframes and high-fidelity mockups for the product listing page with filtering and sorting capabilities.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -10 },
    { title: 'Implement product search with Elasticsearch', description: 'Set up Elasticsearch for full-text product search with autocomplete and faceted filtering.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 5 },
    { title: 'Build shopping cart module', description: 'Develop a persistent shopping cart with real-time price calculations and tax handling.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 10 },
    { title: 'Integrate Stripe payment gateway', description: 'Implement Stripe checkout with support for credit cards, Apple Pay, and Google Pay.', status: TaskStatus.TODO, priority: TaskPriority.HIGH, dueDateOffset: 20 },
    { title: 'Optimize image loading with lazy loading', description: 'Implement lazy loading for product images and add WebP format support.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 15 },
    { title: 'Write unit tests for cart logic', description: 'Achieve 90% code coverage for the shopping cart module.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 25 },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment to staging.', status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, dueDateOffset: -20 },
    { title: 'Performance audit and optimization', description: 'Run Lighthouse audits and optimize Core Web Vitals scores.', status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDateOffset: 30 },
  ],
  'Mobile App Development': [
    { title: 'Set up React Native project', description: 'Initialize the React Native project with TypeScript, navigation, and state management.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -15 },
    { title: 'Implement authentication flow', description: 'Build login, registration, and password reset screens with JWT token handling.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -5 },
    { title: 'Build product catalog screens', description: 'Create product list, detail, and search screens with pull-to-refresh.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 8 },
    { title: 'Implement push notifications', description: 'Set up Firebase Cloud Messaging for order updates and promotional notifications.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 20 },
    { title: 'Add offline data caching', description: 'Implement SQLite caching for offline product browsing and cart persistence.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 25 },
    { title: 'App Store submission prep', description: 'Prepare screenshots, descriptions, and privacy policy for App Store and Play Store.', status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDateOffset: 40 },
  ],
  'API Gateway Migration': [
    { title: 'Design GraphQL schema', description: 'Define the GraphQL schema covering all existing REST endpoints.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -20 },
    { title: 'Set up Apollo Server', description: 'Configure Apollo Server with Express middleware and authentication.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -10 },
    { title: 'Migrate user endpoints', description: 'Convert user CRUD REST endpoints to GraphQL resolvers.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 5 },
    { title: 'Implement query complexity limiting', description: 'Add depth limiting and query cost analysis to prevent abuse.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 15 },
    { title: 'Update API documentation', description: 'Generate interactive API docs using GraphQL Playground and publish to docs portal.', status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDateOffset: 25 },
  ],
  'Customer Analytics Dashboard': [
    { title: 'Design dashboard layout', description: 'Create responsive dashboard layout with chart placeholders and data cards.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -12 },
    { title: 'Implement real-time data pipeline', description: 'Set up Kafka streams for real-time event processing from the main application.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 10 },
    { title: 'Build conversion funnel chart', description: 'Implement interactive funnel visualization showing user journey drop-offs.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDateOffset: 12 },
    { title: 'Create customer segmentation module', description: 'Build RFM analysis and cohort segmentation with exportable reports.', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 18 },
    { title: 'Implement date range picker', description: 'Add global date range filter with preset options (7d, 30d, 90d, custom).', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDateOffset: 14 },
    { title: 'Add export to PDF/CSV', description: 'Enable dashboard export to PDF and CSV formats.', status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDateOffset: 22 },
    { title: 'Set up automated reports', description: 'Schedule weekly email reports with key metrics summaries.', status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDateOffset: 28 },
  ],
  'Security Audit & Compliance': [
    { title: 'Conduct penetration testing', description: 'Perform black-box penetration testing on all public-facing endpoints.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -30 },
    { title: 'Implement GDPR data retention', description: 'Set up automated data deletion for expired user data and consent management.', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, dueDateOffset: -15 },
    { title: 'Add rate limiting to all endpoints', description: 'Implement progressive rate limiting with Redis-backed counters.', status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, dueDateOffset: -10 },
    { title: 'SOC2 compliance documentation', description: 'Write security policies and procedures documentation for SOC2 audit.', status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, dueDateOffset: -5 },
  ],
};

const COMMENTS: { taskTitle: string; authorIndex: number; body: string }[] = [
  { taskTitle: 'Implement product search with Elasticsearch', authorIndex: 1, body: 'I have set up the Elasticsearch cluster. The indexing pipeline is ready for testing.' },
  { taskTitle: 'Implement product search with Elasticsearch', authorIndex: 3, body: 'Great! I will start testing the search queries today.' },
  { taskTitle: 'Build shopping cart module', authorIndex: 2, body: 'The cart state management is done. Working on the tax calculation logic now.' },
  { taskTitle: 'Build shopping cart module', authorIndex: 4, body: 'Should we support multiple currencies? Let me know if that changes the scope.' },
  { taskTitle: 'Integrate Stripe payment gateway', authorIndex: 1, body: 'I have created the Stripe test account. Test API keys are in the env file.' },
  { taskTitle: 'Build product catalog screens', authorIndex: 5, body: 'Product list screen is 80% done. Need to add the skeleton loaders.' },
  { taskTitle: 'Build product catalog screens', authorIndex: 6, body: 'Looking good! The pull-to-refresh animation is smooth.' },
  { taskTitle: 'Design dashboard layout', authorIndex: 7, body: 'Layout is finalized. Charts will use Recharts library for consistency.' },
  { taskTitle: 'Implement real-time data pipeline', authorIndex: 1, body: 'Kafka topics are configured. Consumer groups are ready for the analytics service.' },
  { taskTitle: 'Conduct penetration testing', authorIndex: 0, body: 'Audit completed. Two medium-severity issues found and patched.' },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Seeding database...\n');

  // 1. Create users
  const createdUsers = [];
  for (const demo of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });
    if (existing) {
      console.log(`  User exists: ${demo.email}`);
      createdUsers.push(existing);
      continue;
    }
    const hashed = await bcrypt.hash(demo.password, 12);
    const user = await prisma.user.create({
      data: { name: demo.name, email: demo.email, password: hashed, role: demo.role },
    });
    console.log(`  Created user: ${user.name} (${user.role})`);
    createdUsers.push(user);
  }

  const [admin, pm1, pm2, member1, member2, member3, member4, member5] = createdUsers;
  const members = [member1, member2, member3, member4, member5];

  // 2. Create projects
  console.log('');
  const createdProjects = [];
  const projectOwners = [admin, pm1, pm2, admin, pm1];

  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const existing = await prisma.project.findFirst({ where: { name: p.name } });
    if (existing) {
      console.log(`  Project exists: ${p.name}`);
      createdProjects.push(existing);
      continue;
    }
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        status: p.status,
        deadline: p.deadline,
        ownerId: projectOwners[i].id,
      },
    });
    console.log(`  Created project: ${project.name} (${project.status})`);
    createdProjects.push(project);

    // 3. Add members to project (random subset)
    const memberCount = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...members].sort(() => Math.random() - 0.5);
    const projectMembers = shuffled.slice(0, memberCount);

    for (const m of projectMembers) {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: m.id },
      });
    }
    console.log(`    Added ${projectMembers.length} members`);

    // 4. Create tasks
    const tasks = TASKS_BY_PROJECT[p.name] || [];
    const creators = [projectOwners[i], ...projectMembers];
    const createdTasks = [];

    for (const t of tasks) {
      const assignee = shuffled[Math.floor(Math.random() * shuffled.length)];
      const creator = creators[Math.floor(Math.random() * creators.length)];

      const task = await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: daysFromNow(t.dueDateOffset),
          projectId: project.id,
          assigneeId: assignee.id,
          creatorId: creator.id,
        },
      });
      createdTasks.push(task);
    }
    console.log(`    Created ${createdTasks.length} tasks`);

    // 5. Add comments to some tasks
    const projectComments = COMMENTS.filter((c) =>
      tasks.some((t) => t.title === c.taskTitle)
    );

    for (const c of projectComments) {
      const task = createdTasks.find((t) => t.title === c.taskTitle);
      if (!task) continue;

      const author = createdUsers[c.authorIndex];
      if (!author) continue;

      await prisma.comment.create({
        data: {
          body: c.body,
          taskId: task.id,
          authorId: author.id,
        },
      });
    }
    if (projectComments.length > 0) {
      console.log(`    Added ${projectComments.length} comments`);
    }
  }

  // 6. Summary
  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  const totalComments = await prisma.comment.count();
  const totalMembers = await prisma.projectMember.count();

  console.log('\n--- Seed Summary ---');
  console.log(`  Users:           ${totalUsers}`);
  console.log(`  Projects:        ${totalProjects}`);
  console.log(`  Project Members: ${totalMembers}`);
  console.log(`  Tasks:           ${totalTasks}`);
  console.log(`  Comments:        ${totalComments}`);
  console.log('\nDemo credentials:');
  console.log('  admin@taskflow.dev / demo1234 (ADMIN)');
  console.log('  sarah@taskflow.dev / demo1234 (PROJECT_MANAGER)');
  console.log('  emily@taskflow.dev / demo1234 (TEAM_MEMBER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
