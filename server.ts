import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/api', apiRouter);

// Serve static frontend in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Only listen locally if not on Vercel serverless
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`LuraSpark AI server running on port ${PORT}`);
  });
}

export default app;
