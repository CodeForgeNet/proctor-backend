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
  startTime: Date;
  endTime?: Date;
  videoUrl?: string;
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
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    videoUrl: String,
    events: [EventSchema],
    integrityScore: Number,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<ISession>("Session", SessionSchema);
