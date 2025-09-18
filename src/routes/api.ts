import express from "express";
import * as sessionController from "../controllers/sessionController.js";
import * as logController from "../controllers/logController.js";
import * as reportController from "../controllers/reportController.js";
import * as uploadController from "../controllers/uploadControllers.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/sessions", sessionController.createSession);
router.get("/sessions/:sessionId", sessionController.getSession);
router.put("/sessions/:sessionId/end", sessionController.endSession);

router.post("/logs", logController.logEvents);

router.get("/report/:sessionId/csv", reportController.getCSVReport);
router.get("/report/:sessionId/html", reportController.getHTMLReport);
router.get("/report/:sessionId", reportController.getHTMLReport);

router.post(
  "/upload-video",
  upload.single("video"),
  uploadController.uploadVideo
);

export default router;
