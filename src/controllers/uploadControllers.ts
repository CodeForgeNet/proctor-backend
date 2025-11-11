import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import Session from "../models/Session.js";
import { generateHTMLReport } from "../utils/reportGenerator.js";
import { calculateIntegrityScore } from "../utils/scoreCalculator.js";

export const uploadVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const candidateId = req.user?.uid; // Get candidateId from authenticated user

    if (!sessionId || !candidateId) {
      res.status(400).json({ error: "Session ID and candidate ID are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No video file uploaded" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Ownership check: Only the candidate who claimed the session can upload video
    if (session.candidateId !== candidateId) {
      res.status(403).json({ error: "Forbidden: You are not authorized to upload video for this session." });
      return;
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "proctor-videos",
        public_id: `session-${sessionId}`,
      });

      fs.unlinkSync(req.file.path);

      session.videoUrl = result.secure_url;

      if (!session.endTime) {
        session.endTime = new Date();
      }

      // Generate and save report
      if (session.integrityScore === undefined) {
        session.integrityScore = calculateIntegrityScore(session.events);
      }
      const htmlContent = generateHTMLReport(session);
      const reportDir = path.join(process.cwd(), "reports");
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir);
      }
      const reportPath = path.join(reportDir, `report-${sessionId}.html`);
      fs.writeFileSync(reportPath, htmlContent);
      session.reportUrl = `/reports/report-${sessionId}.html`;


      await session.save();

      res.status(200).json({
        success: true,
        videoUrl: result.secure_url,
        reportUrl: session.reportUrl,
        message: "Video uploaded and report generated successfully",
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);

      const videoUrl = `/uploads/${path.basename(req.file.path)}`;
      session.videoUrl = videoUrl;

      if (!session.endTime) {
        session.endTime = new Date();
      }

      // Generate and save report
      if (session.integrityScore === undefined) {
        session.integrityScore = calculateIntegrityScore(session.events);
      }
      const htmlContent = generateHTMLReport(session);
      const reportDir = path.join(process.cwd(), "reports");
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir);
      }
      const reportPath = path.join(reportDir, `report-${sessionId}.html`);
      fs.writeFileSync(reportPath, htmlContent);
      session.reportUrl = `/reports/report-${sessionId}.html`;

      await session.save();

      res.status(200).json({
        success: true,
        videoUrl,
        reportUrl: session.reportUrl,
        message: "Video saved locally and report generated",
      });
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
};
