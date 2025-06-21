import { PrismaClient } from '@prisma/client';

// Use SQLite for free local development
// Just change DATABASE_URL in .env to: "file:./dev.db"

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
