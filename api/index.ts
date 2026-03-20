import { app, connectDB } from '../app';

export default async (req: any, res: any) => {
  // Ensure DB connection
  await connectDB();
  
  // Pass to Express app
  return app(req, res);
};
