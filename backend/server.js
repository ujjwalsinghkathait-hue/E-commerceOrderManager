import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { validateEnv } from './src/config/env.js';

const PORT = Number(process.env.PORT) || 5000;

/** Graceful shutdown: close HTTP server then Mongo connection */
const shutdown = async (server, signal) => {
  console.info(`${signal} received. Shutting down gracefully…`);
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close(false);
  console.info('HTTP server and MongoDB connection closed.');
  process.exit(0);
};

const start = async () => {
  try {
    validateEnv();
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.info(
        `Server listening on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`
      );
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      shutdown(server, 'unhandledRejection').catch(() => process.exit(1));
    });

    process.on('SIGINT', () => shutdown(server, 'SIGINT'));
    process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
