import serverless from 'serverless-http';
import { app, connectDB } from '../../app';

const serverlessApp = serverless(app);

export const handler = async (event: any, context: any) => {
  // Ensure DB connection
  await connectDB();
  
  // Handle the request
  return await serverlessApp(event, context);
};
