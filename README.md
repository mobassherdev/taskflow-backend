# TaskFlow Backend

> RESTful API built with Express, TypeScript, Prisma, and MongoDB.

[Live Demo](https://taskflow-server-mobassher.vercel.app) · [Frontend Repo](https://github.com/mobassherdev/taskflow-frontend)

## Tech Stack

- **Runtime:** Node.js 22+ with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB via Prisma ORM
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting, bcryptjs
- **Uploads:** Cloudinary + Multer

## Features

- JWT auth with access/refresh token rotation
- Role-based access control (Admin, Project Manager, Team Member)
- CRUD for projects, tasks, comments, attachments
- User management (admin: create, edit, delete with 3-dot dropdown)
- Activity logging
- Real-time notifications
- File uploads via Cloudinary (JPEG, PNG, GIF, WebP, PDF, DOCX, TXT)
- Rate limiting (200 req / 15 min)
- Graceful shutdown handling (SIGTERM, SIGINT)
- Database seeding with demo data (8 users, 5 projects, 30 tasks)
- Vercel serverless deployment

## Project Setup

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Generate Prisma client
pnpm prisma-generate

# Push schema to database
pnpm prisma-dbpush

# Seed demo data
pnpm seed

# Start dev server
pnpm dev
```

The API runs at [http://localhost:5000](http://localhost:5000).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `DATABASE_URL` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Access token secret |
| `JWT_EXPIRES_IN` | No | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Refresh token expiry |
| `CLIENT_URL` | No | `http://localhost:3000` | Frontend URL for CORS (comma-separated for multiple) |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `MAX_FILE_SIZE_MB` | No | `5` | Max upload file size |
| `DEMO_ADMIN_EMAIL` | No | — | Seed admin email |
| `DEMO_ADMIN_PASSWORD` | No | — | Seed admin password |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskflow.dev` | `demo1234` |
| Project Manager | `sarah@taskflow.dev` | `demo1234` |
| Team Member | `emily@taskflow.dev` | `demo1234` |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (Admin, PM) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user (name, email, role, password) |
| DELETE | `/api/users/:id` | Delete user (Admin, PM) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project with members and task count |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | List project tasks (paginated, filterable) |
| POST | `/api/projects/:projectId/tasks` | Create task |
| GET | `/api/projects/:projectId/tasks/:taskId` | Get task with comments & attachments |
| PATCH | `/api/projects/:projectId/tasks/:taskId` | Update task |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | Delete task |
| POST | `/api/projects/:projectId/tasks/:taskId/comments` | Add comment |
| GET | `/api/my-tasks` | Get assigned tasks for current user |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Activity feed |
| GET | `/api/analytics/dashboard` | Dashboard analytics (KPIs, charts) |
| GET | `/api/analytics/projects/:id/progress` | Project progress breakdown |
| GET | `/api/notifications` | User notifications (paginated) |
| GET | `/api/notifications/unread-count` | Unread notification count |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/upload` | File upload (Cloudinary) |
| GET | `/health` | Health check |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with watch (tsx) |
| `pnpm build` | Prisma generate + TypeScript compile + copy generated files + resolve aliases |
| `pnpm start` | Start compiled production server (node dist/server.js) |
| `pnpm seed` | Seed database with demo data |
| `pnpm lint` | Run ESLint |
| `pnpm prisma-generate` | Generate Prisma client |
| `pnpm prisma-dbpush` | Push schema to database |
| `pnpm prisma-migrate` | Run Prisma migrations |
| `pnpm prisma-studio` | Open Prisma Studio |
| `pnpm prisma-reset` | Reset database |

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com/new](https://vercel.com/new)
3. Set environment variables (see table above)
4. Deploy

The `vercel.json` configures:
- `buildCommand`: `pnpm build` (prisma generate + tsc + tsc-alias)
- `installCommand`: `pnpm install`
- Rewrites all routes to `api/index.js` (serverless entry)

> **Note:** Vercel is serverless. For production with persistent connections, consider Railway, Render, or a VPS.

## Project Structure

```
backend/
├── api/
│   └── index.js                  # Vercel serverless entry point
├── prisma/
│   ├── schema.prisma             # Database schema (8 models)
│   └── prisma.config.ts          # Prisma config (datasource, engine)
├── src/
│   ├── app.ts                    # Express app setup (middleware, routes, CORS)
│   ├── server.ts                 # Entry point: bootstrap, DB connect, graceful shutdown
│   ├── seed.ts                   # Database seeder
│   ├── config/
│   │   ├── env.ts                # Typed env config from process.env
│   │   └── db.ts                 # PrismaClient connect/disconnect
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts   # JWT Bearer token auth
│   │   │   ├── authorize.ts      # Role-based authorization
│   │   │   ├── errorHandler.ts   # Global error handler
│   │   │   ├── notFound.ts       # 404 catch-all
│   │   │   ├── rateLimiter.ts    # Rate limiting (200 req/15min)
│   │   │   └── validate.ts       # Zod schema validation
│   │   ├── types/
│   │   │   ├── index.ts          # JwtPayload, PaginationQuery
│   │   │   └── express.d.ts      # Express Request augmentation
│   │   └── utils/
│   │       ├── ApiError.ts       # Custom error class
│   │       ├── ApiResponse.ts    # Response wrapper
│   │       ├── activityLogger.ts # Fire-and-forget activity logging
│   │       ├── asyncHandler.ts   # Async route handler wrapper
│   │       ├── jwt.ts            # Token sign/verify helpers
│   │       └── pagination.ts     # Pagination parsing & meta builder
│   ├── generated/
│   │   └── prisma/               # Auto-generated Prisma client
│   └── modules/
│       ├── auth/                 # Login, signup, tokens, change-password
│       │   ├── auth.routes.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── auth.schema.ts
│       ├── users/                # User CRUD (admin)
│       │   ├── user.routes.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── user.schema.ts
│       ├── projects/             # Project CRUD + member management
│       │   ├── project.routes.ts
│       │   ├── project.controller.ts
│       │   ├── project.service.ts
│       │   └── project.schema.ts
│       ├── tasks/                # Task CRUD + comments + attachments
│       │   ├── task.routes.ts
│       │   ├── task.controller.ts
│       │   ├── task.service.ts
│       │   └── task.schema.ts
│       ├── notifications/        # Notifications CRUD
│       │   ├── notification.routes.ts
│       │   ├── notification.controller.ts
│       │   └── notification.service.ts
│       ├── activity/             # Activity feed
│       │   ├── activity.routes.ts
│       │   ├── activity.controller.ts
│       │   └── activity.service.ts
│       ├── analytics/            # Dashboard stats, project progress
│       │   ├── analytics.routes.ts
│       │   ├── analytics.controller.ts
│       │   └── analytics.service.ts
│       └── upload/               # File uploads via Cloudinary
│           ├── upload.routes.ts
│           └── upload.controller.ts
```

## License

MIT License

---

More Projects and Information
Explore additional projects and find out more about my work on my portfolio website: [Md Mobassher Hossain](https://mobassher.com)
