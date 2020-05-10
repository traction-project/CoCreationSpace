import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

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

UserSchema.methods.generateToken = function (validityInDays = 60): string {
  // Generate timestamp n days from now
  const now = new Date();
  const expirationDate = new Date().setDate(now.getDate() + validityInDays);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: Math.floor(expirationDate / 1000)
  }, "secret");
};

UserSchema.methods.getAuth = function () {
  return {
    _id: this._id,
    username: this.username,
    token: this.generateToken()
  };
};

interface User extends Document {
  username: string;
  password: string;
  salt: string;
  dateCreated: Date;
  dateUpdated: Date;

  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
  generateToken: (validityInDays?: number) => string;
  getAuth: () => { _id: string, username: string, token: string };
}

export default model<User>("User", UserSchema);
