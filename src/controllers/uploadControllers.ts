import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import Session from "../models/Session.js";

export const uploadVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: "Session ID is required" });
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

      await session.save();

      res.status(200).json({
        success: true,
        videoUrl: result.secure_url,
        message: "Video uploaded successfully",
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);

      const videoUrl = `/uploads/${path.basename(req.file.path)}`;
      session.videoUrl = videoUrl;

      if (!session.endTime) {
        session.endTime = new Date();
      }

      await session.save();

      res.status(200).json({
        success: true,
        videoUrl,
        message: "Video saved locally",
      });
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
};
