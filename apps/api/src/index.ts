import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabases } from './config/database';
import { initializeFirebase } from './config/firebase';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { farmRoutes } from './routes/farms';
import { diagnosticRoutes } from './routes/diagnostics';
import { marketplaceRoutes } from './routes/marketplace';
import { chatRoutes } from './routes/chat';
import { aiRoutes } from './routes/ai';
import { financeRoutes } from './routes/finance';
import healthRoutes from './routes/health';
import { aiService } from './services/aiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', healthRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabases();
    await initializeFirebase();
    await aiService.initialize();
    
    app.listen(PORT, () => {
      console.log(`🌱 ZundeNova API server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 AI services initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
