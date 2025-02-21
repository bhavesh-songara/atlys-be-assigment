import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
