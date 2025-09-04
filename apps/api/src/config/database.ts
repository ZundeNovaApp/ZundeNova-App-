import { PrismaClient } from '@zundenova/database';
import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';

export const prisma: PrismaClient = new PrismaClient();
export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export async function connectDatabases() {
  try {
    try {
      await prisma.$connect();
      console.log('✅ Connected to PostgreSQL');
    } catch (error) {
      console.log('⚠️ PostgreSQL not available, running in demo mode');
    }

    try {
      await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/zundenova');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.log('⚠️ MongoDB not available, running in demo mode');
    }

    try {
      await redisClient.connect();
      console.log('✅ Connected to Redis');
    } catch (error) {
      console.log('⚠️ Redis not available, running in demo mode');
    }
  } catch (error) {
    console.log('⚠️ Running in demo mode without full database connectivity');
  }
}

export async function disconnectDatabases() {
  await prisma.$disconnect();
  await mongoose.disconnect();
  await redisClient.quit();
}
