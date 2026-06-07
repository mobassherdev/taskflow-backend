# TaskFlow Backend

> RESTful API built with Express, TypeScript, Prisma, and MongoDB.

[Live Demo](https://your-live-link.vercel.app) · [Frontend Repo](../frontend)

## Tech Stack

- **Runtime:** Node.js + TypeScript
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
- User management (admin)
- Activity logging
- Real-time notifications
- File uploads via Cloudinary
- Rate limiting
- Graceful shutdown handling
- Database seeding with demo data

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
| `JWT_SECRET` | Yes | — | Access token secret (min 10 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token secret (min 10 chars) |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Refresh token expiry |
| `CLIENT_URL` | No | `http://localhost:3000` | Frontend URL for CORS |
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

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (Admin, PM) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (Admin, PM) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | List project tasks |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PATCH | `/api/projects/:projectId/tasks/:taskId` | Update task |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | Delete task |
| GET | `/api/my-tasks` | Get assigned tasks |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Activity feed |
| GET | `/api/analytics/dashboard` | Dashboard analytics |
| GET | `/api/notifications` | User notifications |
| GET | `/health` | Health check |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with watch |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Start production server |
| `pnpm seed` | Seed database with demo data |
| `pnpm prisma-generate` | Generate Prisma client |
| `pnpm prisma-dbpush` | Push schema to database |
| `pnpm prisma-studio` | Open Prisma Studio |

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com/new](https://vercel.com/new)
3. Set environment variables (see table above)
4. Set build command: `pnpm prisma-generate && pnpm build`
5. Set output directory: `dist`
6. Deploy

> **Note:** Vercel is serverless. For production with persistent connections, consider Railway, Render, or a VPS.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── config/                 # Env, DB, CORS config
│   ├── middleware/              # Auth, error handling, rate limiting
│   ├── modules/
│   │   ├── auth/               # Login, signup, tokens
│   │   ├── users/              # User CRUD
│   │   ├── projects/           # Project CRUD
│   │   ├── tasks/              # Task CRUD
│   │   ├── notifications/      # Notifications
│   │   ├── activity/           # Activity logging
│   │   ├── analytics/          # Dashboard stats
│   │   └── upload/             # File uploads
│   ├── utils/                  # Helpers, error classes
│   ├── types/                  # TypeScript types
│   ├── seed.ts                 # Database seeder
│   ├── app.ts                  # Express app setup
│   └── index.ts                # Server entry point
```
License
MIT License

---

More Projects and Information
👉 Explore additional projects and find out more about my work on my portfolio website: [Md Mobassher Hossain](https://mobassher.com)