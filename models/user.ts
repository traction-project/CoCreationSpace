import * as crypto from "crypto";
import { Document, Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: String,
  password: String,
  salt: String,
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto.pbkdf2Sync(
    password, this.salt,
    10000, 512,
    "sha512"
  ).toString("hex");
};

UserSchema.methods.validatePassword = function (password: string): boolean {
  const hashedPassword = crypto.pbkdf2Sync(
    password, this.salt,
    10000, 512,
    "sha512"
  ).toString("hex");

  return this.password == hashedPassword;
};

interface User extends Document {
  username: string;
  password: string;
  salt: string;
  dateCreated: Date;
  dateUpdated: Date;

  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
}

export default model<User>("User", UserSchema);