import type { Request, Response } from "express";
import Session from "../models/Session.js";
import { calculateIntegrityScore } from "../utils/scoreCalculator.js";

export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("createSession: Function entered.");
  try {
    const { candidateEmail } = req.body;
    const interviewerId = req.user?.uid;

    console.log("createSession: Received candidateEmail:", candidateEmail, "interviewerId:", interviewerId);

    if (!candidateEmail || !interviewerId) {
      console.log("createSession: Missing required fields. Sending 400.");
      res.status(400).json({ error: "Candidate email and interviewer ID are required" });
      return;
    }

    const candidateName = req.body.candidateName || candidateEmail.split('@')[0];

    console.log("createSession: Creating new Session instance.");
    const session = new Session({
      candidateName,
      candidateEmail,
      interviewerId,
      startTime: new Date(),
      events: [],
    });

    console.log("createSession: Attempting to save session...");
    await session.save();
    console.log("createSession: Session saved successfully. ID:", session._id);
    console.log("createSession: Session object before response:", session);

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
    const interviewerId = req.user?.uid; // Get interviewerId from authenticated user

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Ownership check
    if (session.interviewerId !== interviewerId) {
      res.status(403).json({ error: "Forbidden: You do not own this session." });
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
    const authenticatedUserId = req.user?.uid; // Get authenticated user ID
    const authenticatedUserRole = req.user?.role; // Get authenticated user role

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Ownership check:
    // Interviewer who created the session can view it
    // Candidate who claimed the session can view it
    if (authenticatedUserRole === 'interviewer' && session.interviewerId !== authenticatedUserId) {
      res.status(403).json({ error: "Forbidden: You do not have access to this session." });
      return;
    }
    if (authenticatedUserRole === 'candidate' && session.candidateId !== authenticatedUserId) {
      res.status(403).json({ error: "Forbidden: You do not have access to this session." });
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

export const getSessionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const authenticatedUserId = req.user?.uid; // Get authenticated user ID
    const authenticatedUserRole = req.user?.role; // Get authenticated user role

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Ownership check:
    // Candidate who claimed the session can view it
    if (authenticatedUserRole === 'candidate' && session.candidateId !== authenticatedUserId) {
      res.status(403).json({ error: "Forbidden: You do not have access to this session." });
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session status:", error);
    res.status(500).json({ error: "Failed to fetch session status" });
  }
};

export const claimSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const candidateId = req.user?.uid;
    const candidateEmail = req.user?.email;

    if (!sessionId || !candidateId || !candidateEmail) {
      res.status(400).json({ error: "Session ID, candidate ID, and candidate email are required." });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found." });
      return;
    }

    // Check if the session is already claimed by another candidate
    if (session.candidateId && session.candidateId !== candidateId) {
      res.status(403).json({ error: "Session already claimed by another candidate." });
      return;
    }

    // Verify that the authenticated candidate's email matches the session's candidate email
    if (session.candidateEmail !== candidateEmail) {
      res.status(403).json({ error: "Forbidden: This session is not assigned to your email." });
      return;
    }

    session.candidateId = candidateId;
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error("Error claiming session:", error);
    res.status(500).json({ error: "Failed to claim session." });
  }
};

