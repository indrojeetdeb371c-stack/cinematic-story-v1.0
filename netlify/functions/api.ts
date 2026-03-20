import serverless from 'serverless-http';
import { app, connectDB } from '../../api/app.js';

const serverlessApp = serverless(app);

export const handler = async (event: any, context: any) => {
  // Ensure DB connection
  await connectDB();
  
  // Handle the request
  return await serverlessApp(event, context);
};
