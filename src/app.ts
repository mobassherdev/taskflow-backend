import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authenticate } from "./common/middleware/authenticate";
import { errorHandler } from "./common/middleware/errorHandler";
import { notFound } from "./common/middleware/notFound";
import { rateLimiter } from "./common/middleware/rateLimiter";

import activityRoutes from "./modules/activity/activity.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import authRoutes from "./modules/auth/auth.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import projectRoutes from "./modules/projects/project.routes";
import { getUserTasks } from "./modules/tasks/task.controller";
import taskRoutes from "./modules/tasks/task.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import userRoutes from "./modules/users/user.routes";

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = env.corsOrigin;
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not in [${allowed}]`));
    }
  },
  credentials: true,
}));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", rateLimiter);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date() })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/my-tasks", authenticate, getUserTasks);
app.use("/api/activities", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
