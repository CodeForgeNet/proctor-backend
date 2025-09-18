import type { Request, Response } from "express";
import Session from "../models/Session.js";

export const logEvents = async (req: Request, res: Response): Promise<void> => {
  console.log("Received logEvents request body:", req.body);
  try {
    const { sessionId, events } = req.body;
    console.log("logEvents: sessionId received:", sessionId);
    console.log("logEvents: events received:", events);

    if (!sessionId || !events || !Array.isArray(events)) {
      console.log("logEvents: Invalid data received. sessionId or events missing/malformed.");
      res
        .status(400)
        .json({ error: "Session ID and events array are required" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      console.log("logEvents: Session not found for ID:", sessionId);
      res.status(404).json({ error: "Session not found" });
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
