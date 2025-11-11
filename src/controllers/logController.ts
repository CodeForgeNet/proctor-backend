import type { Request, Response } from "express";
import Session from "../models/Session.js";

export const logEvents = async (req: Request, res: Response): Promise<void> => {
  console.log("Received logEvents request body:", req.body);
  try {
    const { sessionId, events } = req.body;
    const candidateId = req.user?.uid; // Get candidateId from authenticated user

    console.log("logEvents: sessionId received:", sessionId);
    console.log("logEvents: events received:", events);
    console.log("logEvents: candidateId received:", candidateId);

    if (!sessionId || !events || !Array.isArray(events) || !candidateId) {
      console.log("logEvents: Invalid data received. sessionId, events, or candidateId missing/malformed.");
      res
        .status(400)
        .json({ error: "Session ID, events array, and candidate ID are required" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      console.log("logEvents: Session not found for ID:", sessionId);
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Ownership check: Only the candidate who claimed the session can log events
    if (session.candidateId !== candidateId) {
      console.log("logEvents: Forbidden. Session candidateId:", session.candidateId, "Authenticated candidateId:", candidateId);
      res.status(403).json({ error: "Forbidden: You are not authorized to log events for this session." });
      return;
    }

    session.events.push(...events);
    await session.save();

    res.status(200).json({ success: true, eventCount: events.length });
  } catch (error) {
    console.error("Error logging events:", error);
    res.status(500).json({ error: "Failed to log events" });
  }
};
