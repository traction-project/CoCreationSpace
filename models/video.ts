import { Document, Schema, model } from "mongoose";
import { User } from "./user";

const VideoSchema = new Schema({
  title: String,
  path: String,
  transcodingJobId: String,
  transcriptionJobId: String,
  status: { type: String, default: "pending" },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  thumbnails: [String],
  resolutions: [Number],
  duration: Number,
  key: String,
  transcript: Object
});

interface Video extends Document {
  title: string;
  path: string;
  status: "pending" | "processing" | "done" | "error";
  transcodingJobId: string;
  transcriptionJobId: string;
  dateCreated: Date;
  dateUpdated: Date;
  uploadedBy: User["_id"];
  thumbnails: Array<string>;
  resolutions: Array<number>;
  duration: number;
  key: string;
  transcript: any;
}

export default model<Video>("Video", VideoSchema);
