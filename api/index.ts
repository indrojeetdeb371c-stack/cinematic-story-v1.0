import { app, connectDB } from '../app';

export default async (req: any, res: any) => {
  console.log(`Vercel API Request: ${req.method} ${req.url}`);
  
  try {
    // Ensure DB connection
    await connectDB();
    
    // Pass to Express app
    return app(req, res);
  } catch (err) {
    console.error('Vercel API Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) });
  }
};
