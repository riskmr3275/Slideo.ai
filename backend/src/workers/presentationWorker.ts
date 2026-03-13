import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export const presentationQueue = new Queue('presentation-generation', { connection: connection as any });

export const setupWorker = () => {
  const worker = new Worker(
    'presentation-generation',
    async (job) => {
      console.log(`Processing job ${job.id} for presentation generation...`);
      // Here you would put the OpenAI generation logic if it were truly async
      // For now, it's just a placeholder to show the architecture
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`Finished job ${job.id}`);
    },
    { connection: connection as any }
  );

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error ${err.message}`);
  });

  return worker;
};
