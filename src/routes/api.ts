import express from "express";
import * as sessionController from "../controllers/sessionController.js";
import * as logController from "../controllers/logController.js";
import * as uploadController from "../controllers/uploadControllers.js";
import * as authController from "../controllers/authController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Authentication and Authorization Routes
router.post("/set-custom-claims", authenticateToken, authController.setCustomUserClaims);

// Example of a role-protected route
router.get("/interviewer-dashboard", authenticateToken, authorizeRoles(['interviewer']), (req, res) => {
  res.status(200).json({ message: `Welcome to the interviewer dashboard, ${req.user?.email}!` });
});

// Session Management (Interviewer only)
router.post("/sessions", authenticateToken, authorizeRoles(['interviewer']), sessionController.createSession);
router.get("/sessions/:sessionId", authenticateToken, authorizeRoles(['interviewer', 'candidate']), sessionController.getSession); // Candidate can also get their session
router.get("/session-status/:sessionId", authenticateToken, authorizeRoles(['interviewer', 'candidate']), sessionController.getSessionStatus);
router.put("/sessions/:sessionId/end", authenticateToken, authorizeRoles(['interviewer']), sessionController.endSession);

// Session Claim (Candidate only)
router.post("/sessions/claim", authenticateToken, authorizeRoles(['candidate']), sessionController.claimSession);

// Event Logging (Candidate only)
router.post("/logs", authenticateToken, authorizeRoles(['candidate']), logController.logEvents);

// Video Upload (Candidate only)
router.post(
  "/upload-video",
  authenticateToken,
  authorizeRoles(['candidate']),
  upload.single("video"),
  uploadController.uploadVideo
);

export default router;
