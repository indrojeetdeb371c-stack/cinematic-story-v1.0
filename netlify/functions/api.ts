import serverless from 'serverless-http';
import { app, apiRouter, connectDB } from '../../server';

// Ensure API routes are mounted
// Note: In server.ts, we already have app.use('/api', apiRouter) inside startServer,
// but for Netlify, we need to ensure it's mounted.
// However, netlify.toml redirects /api/* to this function, 
// so the function receives the path without /api if we are not careful.
// Actually, serverless-http handles the path.

const serverlessApp = serverless(app);

export const handler = async (event: any, context: any) => {
  // Ensure DB connection
  await connectDB();
  
  // Handle the request
  return await serverlessApp(event, context);
};
