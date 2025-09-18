import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  type: string;
  timestamp: Date;
  durationMs?: number;
  meta?: any;
  sessionId: mongoose.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "looking_away",
        "user_absent",
        "multiple_faces",
        "suspicious_object",
        "drowsiness_detected",
      ],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationMs: Number,
    meta: Schema.Types.Mixed,
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ sessionId: 1, timestamp: 1 });
EventSchema.index({ type: 1 });

export default mongoose.model<IEvent>("Event", EventSchema);
