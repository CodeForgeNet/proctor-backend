import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEvent {
  type: string;
  timestamp: Date;
  durationMs?: number;
  meta?: any;
}

export interface ISession extends Document {
  _id: Types.ObjectId;
  candidateName: string;
  interviewerId: string;
  candidateEmail: string; // Renamed from interviewerEmail
  candidateId?: string; // New optional field
  startTime: Date;
  endTime?: Date;
  videoUrl?: string;
  reportUrl?: string;
  events: IEvent[];
  integrityScore?: number;
}

const EventSchema = new Schema<IEvent>({
  type: {
    type: String,
    required: true,
    enum: [
      "looking_away",
      "user_absent",
      "multiple_faces",
      "suspicious_object",
      "drowsiness_detected",
      "background_voice",
    ],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  durationMs: Number,
  meta: Schema.Types.Mixed,
});

const SessionSchema = new Schema<ISession>(
  {
    candidateName: {
      type: String,
      required: true,
    },
    interviewerId: {
      type: String,
      required: true,
    },
    candidateEmail: { // Renamed from interviewerEmail
      type: String,
      required: false,
    },
    candidateId: { // New optional field
      type: String,
      required: false, // Candidate ID is set after candidate claims the session
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    videoUrl: String,
    reportUrl: String,
    events: [EventSchema],
    integrityScore: Number,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id; // Map _id to id
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<ISession>("Session", SessionSchema);
