// Mock Redis client to avoid errors during development
// Replace with actual database queries using Prisma

class MockRedis {
  private store: Map<string, any> = new Map();

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    this.store.delete(key);
    return 1;
  }

  async exists(key: string) {
    return this.store.has(key) ? 1 : 0;
  }

  async keys(pattern: string) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }
}

export const redis = new MockRedis();

// In production, replace with:
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
