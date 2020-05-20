import { Document, Schema, model } from "mongoose";

const VideoSchema = new Schema({
  title: String,
  path: String,
  status: { type: String, default: "pending" },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

interface Video extends Document {
  title: string;
  path: string;
  status: "pending" | "processing" | "done" | "error";
  dateCreated: Date;
  dateUpdated: Date;
}

export default model<Video>("Video", VideoSchema);
