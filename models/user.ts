import * as crypto from "crypto";
import { Schema, model } from "mongoose";

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

export default model("User", UserSchema);
