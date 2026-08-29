import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/createApp';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = createApp();

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Resolve dist path robustly across local build and container environments
    const rootDist = path.join(process.cwd(), 'dist');
    const dirnameDist = typeof __dirname !== 'undefined' ? __dirname : '';
    const distPath = fs.existsSync(path.join(rootDist, 'index.html'))
      ? rootDist
      : dirnameDist && fs.existsSync(path.join(dirnameDist, 'index.html'))
      ? dirnameDist
      : rootDist;

    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!DOCTYPE html><html><body><h1>PitchForge AI is starting...</h1></body></html>');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PitchForge AI server listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown handling for cloud web service lifecycles
  const shutdown = () => {
    console.log('Received shutdown signal, closing server gracefully...');
    server.close(() => {
      console.log('PitchForge AI server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
