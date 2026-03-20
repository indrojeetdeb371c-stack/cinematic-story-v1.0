import express from 'express';
import { app, connectDB } from './api/app.js';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const PORT = 3000;

// Connect to database
connectDB();

// Vite Integration
async function startServer() {
  console.log('Starting server initialization...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NETLIFY:', process.env.NETLIFY);
  console.log('PORT:', PORT);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite in middleware mode...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware initialized.');
    } catch (err) {
      console.error('Failed to initialize Vite server:', err);
      throw err;
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Always listen on port 3000 in this environment
  console.log(`Attempting to listen on port ${PORT}...`);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
});
