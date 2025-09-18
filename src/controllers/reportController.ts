import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Session from "../models/Session.js";
import {
  generateCSVReport,
  writeCSVToFile,
  generateHTMLReport,
} from "../utils/reportGenerator.js";
import { calculateIntegrityScore } from "../utils/scoreCalculator.js";

export const getCSVReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: "Session ID is required" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.integrityScore === undefined) {
      session.integrityScore = calculateIntegrityScore(session.events);
      await session.save();
    }

    const csvContent = generateCSVReport(session);
    const filePath = writeCSVToFile(sessionId, csvContent);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${sessionId}.csv`
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Error generating CSV report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

export const getHTMLReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: "Session ID is required" });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.integrityScore === undefined) {
      session.integrityScore = calculateIntegrityScore(session.events);
      await session.save();
    }

    const htmlContent = generateHTMLReport(session);

    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error generating HTML report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};
