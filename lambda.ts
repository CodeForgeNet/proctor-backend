import serverlessHttp from 'serverless-http';
import app from './src/app.js'; // Adjust path if your app.ts is elsewhere

// This is your Lambda handler
export const handler = serverlessHttp(app);
