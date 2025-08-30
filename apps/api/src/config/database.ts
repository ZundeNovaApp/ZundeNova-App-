import { PrismaClient } from '@zundenova/database';
import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';

export const prisma: PrismaClient = new PrismaClient();
export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export async function connectDatabases() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/zundenova');
    console.log('✅ Connected to MongoDB');

    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabases() {
  await prisma.$disconnect();
  await mongoose.disconnect();
  await redisClient.quit();
}
