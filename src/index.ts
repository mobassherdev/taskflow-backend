import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { env } from './config/env';

let server: Server;

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
  try {
    // 1. Database Connection
    console.log('⏳ Connecting to database...');
    await connectDB();
    console.log('✅ Database connection established.');

    // 2. Start Express Server
    server = app.listen(env.PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('   🚀 TASKFLOW - BACKEND IS LIVE');
      console.log('='.repeat(50));
      console.log(`   - Environment: ${env.NODE_ENV}`);
      console.log(`   - Local:       http://localhost:${env.PORT}`);
      console.log(`   - Health:      http://localhost:${env.PORT}/health`);
      console.log(`   - CORS:        ${env.CLIENT_URL}`);
      console.log('='.repeat(50) + '\n');
    });

    // 3. Setup Process Listeners for Graceful Shutdown
    setupProcessHandlers();
  } catch (error) {
    console.error('\n❌ Fatal error during server startup:');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Configures handlers for unexpected errors and termination signals
 */
function setupProcessHandlers(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('\n💥 UNHANDLED REJECTION! Shutting down...');
    console.error(reason);
    shutdownGracefully(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('\n💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error);
    shutdownGracefully(1);
  });

  // Handle termination signals (Docker, PM2, etc.)
  process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received. Shutting down gracefully...');
    shutdownGracefully(0);
  });

  // Handle interrupt signals (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');
    shutdownGracefully(0);
  });
}

/**
 * Gracefully shuts down the server and database connection
 */
async function shutdownGracefully(exitCode: number): Promise<void> {
  if (server) {
    server.close(async () => {
      console.log('📍 HTTP server closed.');

      try {
        await disconnectDB();
        console.log('📍 Database connection closed.');
      } catch (err) {
        console.error('📍 Error closing database connection:', err);
      }

      console.log(`👋 Process exited with code ${exitCode}`);
      process.exit(exitCode);
    });

    // Force shutdown after timeout if graceful shutdown hangs
    setTimeout(() => {
      console.error(
        '📍 Could not close connections in time, forcefully shutting down',
      );
      process.exit(1);
    }, 10000);
  } else {
    process.exit(exitCode);
  }
}

// Kickstart the server
bootstrap().catch((error) => {
  console.error('\n❌ TOP-LEVEL BOOTSTRAP ERROR:');
  console.error(error);
  process.exit(1);
});
