import type { IEvent } from "../models/Session.js";

interface DeductionRule {
  type: string;
  points: number;
  meta?: {
    field?: string;
    value?: string;
    points?: number;
  };
}

const DEDUCTION_RULES: DeductionRule[] = [
  { type: "looking_away", points: 2 },
  { type: "user_absent", points: 5 },
  { type: "multiple_faces", points: 10 },
  {
    type: "suspicious_object",
    points: 10,
    meta: {
      field: "class",
      value: "cell phone",
      points: 15,
    },
  },
  { type: "drowsiness_detected", points: 5 },
  { type: "background_voice", points: 3 },
];

export function calculateIntegrityScore(events: IEvent[]): number {
  let score = 100;
  const deductions: { type: string; points: number }[] = [];

  events.forEach((event) => {
    const rule = DEDUCTION_RULES.find((r) => r.type === event.type);

    if (rule) {
      let deductionPoints = rule.points;

      if (
        rule.meta &&
        event.meta &&
        rule.meta.field &&
        rule.meta.value &&
        event.meta[rule.meta.field] === rule.meta.value
      ) {
        deductionPoints = rule.meta.points || rule.points;
      }

      score -= deductionPoints;
      deductions.push({ type: event.type, points: deductionPoints });
    }
  });

  return Math.max(0, Math.round(score));
}

export function getDeductions(
  events: IEvent[]
): { type: string; points: number }[] {
  const deductions: { type: string; points: number }[] = [];

  events.forEach((event) => {
    const rule = DEDUCTION_RULES.find((r) => r.type === event.type);

    if (rule) {
      let deductionPoints = rule.points;

      if (
        rule.meta &&
        event.meta &&
        rule.meta.field &&
        rule.meta.value &&
        event.meta[rule.meta.field] === rule.meta.value
      ) {
        deductionPoints = rule.meta.points || rule.points;
      }

      deductions.push({ type: event.type, points: deductionPoints });
    }
  });

  return deductions;
}
