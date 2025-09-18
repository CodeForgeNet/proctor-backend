import type { Request, Response } from "express";
import Session from "../models/Session.js";
import { calculateIntegrityScore } from "../utils/scoreCalculator.js";

export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("createSession: Function entered.");
  try {
    const { candidateName } = req.body;
    console.log("createSession: Received candidateName:", candidateName);

    if (!candidateName) {
      console.log("createSession: Candidate name missing. Sending 400.");
      res.status(400).json({ error: "Candidate name is required" });
      return;
    }

    console.log("createSession: Creating new Session instance.");
    const session = new Session({
      candidateName,
      startTime: new Date(),
      events: [],
    });

    console.log("createSession: Attempting to save session...");
    await session.save();
    console.log("createSession: Session saved successfully. ID:", session._id);

    res.status(201).json(session);
    console.log("createSession: Response sent.");
  } catch (error) {
    console.error("createSession: Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
};

export const endSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    session.endTime = new Date();

    session.integrityScore = calculateIntegrityScore(session.events);

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
};

export const getSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};
