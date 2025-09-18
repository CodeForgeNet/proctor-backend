import fs from "fs";
import path from "path";
import type { ISession, IEvent } from "../models/Session.js";
import { getDeductions } from "./scoreCalculator.js";

export function generateCSVReport(session: ISession): string {
  const headers = "Timestamp,Event Type,Duration (s),Details\n";

  const rows = session.events
    .map((event: IEvent) => {
      const timestamp = new Date(event.timestamp).toISOString();
      const duration = event.durationMs
        ? (event.durationMs / 1000).toFixed(1)
        : "";

      let details = "";
      if (event.meta) {
        details = Object.entries(event.meta)
          .map(([key, value]) => `${key}=${value}`)
          .join("; ");
      }

      return `${timestamp},${event.type},${duration},${details}`;
    })
    .join("\n");

  const deductions = getDeductions(session.events);
  const deductionSummary = deductions.reduce(
    (
      acc: Record<string, { count: number; points: number }>,
      { type, points }: { type: string; points: number }
    ) => {
      if (!acc[type]) acc[type] = { count: 0, points: 0 };
      acc[type].count++;
      acc[type].points += points;
      return acc;
    },
    {} as Record<string, { count: number; points: number }>
  );

  const summary =
    "\n\nSUMMARY\n" +
    "Event Type,Count,Points Deducted\n" +
    Object.entries(deductionSummary)
      .map(([type, { count, points }]) => `${type},${count},${points}`)
      .join("\n") +
    `\n\nFinal Integrity Score,${session.integrityScore || 0}\n`;

  return headers + rows + summary;
}

export function writeCSVToFile(sessionId: string, csvContent: string): string {
  const reportsDir = path.join(__dirname, "../../reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `report-${sessionId}.csv`;
  const filePath = path.join(reportsDir, filename);

  fs.writeFileSync(filePath, csvContent, "utf8");

  return filePath;
}

export function generateHTMLReport(session: ISession): string {
  const eventsHTML = session.events
    .map((event: IEvent) => {
      const timestamp = new Date(event.timestamp).toLocaleString();
      const duration = event.durationMs
        ? `(${(event.durationMs / 1000).toFixed(1)}s)`
        : "";

      let details = "";
      if (event.meta) {
        details = Object.entries(event.meta)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }

      return `
      <tr>
        <td>${timestamp}</td>
        <td>${event.type}</td>
        <td>${duration}</td>
        <td>${details}</td>
      </tr>
    `;
    })
    .join("");

  const eventCounts = session.events.reduce(
    (acc: Record<string, number>, event: IEvent) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Proctoring Report - ${session.candidateName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 30px; }
        .score { font-size: 24px; font-weight: bold; color: #333; }
        .good { color: green; }
        .warning { color: orange; }
        .poor { color: red; }
      </style>
    </head>
    <body>
      <h1>Interview Proctoring Report</h1>
      <p><strong>Candidate:</strong> ${session.candidateName}</p>
      <p><strong>Session Date:</strong> ${new Date(
        session.startTime
      ).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${
        session.endTime
          ? Math.round(
              (new Date(session.endTime).getTime() -
                new Date(session.startTime).getTime()) /
                60000
            )
          : "?"
      } minutes</p>
      
      <h2>Event Log</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>Duration</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${eventsHTML}
        </tbody>
      </table>
      
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Events: ${session.events.length}</p>
        <ul>
          ${Object.entries(eventCounts)
            .map(([type, count]) => `<li>${type}: ${count}</li>`)
            .join("")}
        </ul>
        
        <h2>Integrity Score</h2>
        <p class="score ${
          (session.integrityScore || 0) > 80
            ? "good"
            : (session.integrityScore || 0) > 60
            ? "warning"
            : "poor"
        }">
          ${session.integrityScore || 0}/100
        </p>
      </div>
    </body>
    </html>
  `;

  return html;
}
