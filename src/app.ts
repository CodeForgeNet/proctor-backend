import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "./config/firebaseAdmin.js"; // Initialize Firebase Admin SDK

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(morgan("dev"));

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

const uploadsDir = process.env.VIDEO_STORAGE_PATH || "./uploads";
app.use("/uploads", express.static(path.join(__dirname, "..", uploadsDir)));

app.use("/reports", express.static(path.join(__dirname, "../reports")));

app.use("/api", apiRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

// Export the app for serverless environments
export default app;

// Only start the server if not in a serverless environment
if (process.env.NODE_ENV !== 'production' && process.env.IS_OFFLINE !== 'true' && process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
