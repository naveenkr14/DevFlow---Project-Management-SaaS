import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.port, () => {
  console.log(`DevFlow API running on port ${env.port}`);
});

let shuttingDown = false;

const shutdown = (signal: string) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}; shutting down DevFlow API.`);

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
      process.exitCode = error ? 1 : 0;
    } catch {
      process.exitCode = 1;
    }
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
