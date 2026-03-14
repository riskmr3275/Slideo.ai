import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

import authRoutes from './routes/authRoutes';
import presentationRoutes from './routes/presentationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import importRoutes from './routes/importRoutes';
import templateRoutes from './routes/templateRoutes';
import emailRoutes from './routes/emailRoutes';
import shareRoutes from './routes/shareRoutes';
import planRoutes from './routes/planRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setupCollaborationSocket } from './services/collaborationSocket';

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  console.log('Test route hit at the TOP');
  res.send('OK TOP');
});

console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/import', importRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/plans', planRoutes);
console.log('Routes registered.');

app.get('/api/templates/debug', (req, res) => {
  res.json({ status: 'ok', msg: 'Template prefix is working' });
});

app.get('/health', async (req, res) => {
  console.log('Health check hit');
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) });
  }
});

app.use(errorHandler);

import { setupWorker } from './workers/presentationWorker';

if (process.env.NODE_ENV !== 'test') {
  setupWorker();
  setupCollaborationSocket(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app, prisma };
