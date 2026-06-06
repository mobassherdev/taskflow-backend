import cors from "cors";
import express, { Application, Router } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { rateLimiter } from "./middleware/rateLimiter";
import { authenticate } from "./middleware/authenticate";

import activityRoutes from "./modules/activity/activity.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import authRoutes from "./modules/auth/auth.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import projectRoutes from "./modules/projects/project.routes";
import taskRoutes from "./modules/tasks/task.routes";
import { getUserTasks } from "./modules/tasks/task.controller";
import uploadRoutes from "./modules/upload/upload.routes";
import userRoutes from "./modules/users/user.routes";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
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
