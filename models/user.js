import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  email: String,
  firstname: String,
  lastname: String,
  password: String,
  avatar: String,
  nip: String,
});

export const User = mongoose.model("User", UserSchema);
