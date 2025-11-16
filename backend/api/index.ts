import app from '../src/server';
import { connectDB } from '../src/config/database';

// Ensure database connection before handling requests
const handler = async (req: any, res: any) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
};

export default handler;
