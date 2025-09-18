import type { Request, Response } from "express";
import Session from "../models/Session.js";
import { calculateIntegrityScore } from "../utils/scoreCalculator.js";

export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { candidateName } = req.body;

    if (!candidateName) {
      res.status(400).json({ error: "Candidate name is required" });
      return;
    }

    const session = new Session({
      candidateName,
      startTime: new Date(),
      events: [],
    });

    await session.save();

    res.status(201).send(session._id.toString());
  } catch (error) {
    console.error("Error creating session:", error);
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
