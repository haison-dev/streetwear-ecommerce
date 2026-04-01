import Session from "../../models/Session.js";
import User from "../../models/User.js";

export const findUserByEmail = (email) =>
  User.findOne({ email }).populate({ path: "roles", select: "_id name" });

export const findRawUserByEmail = (email) => User.findOne({ email });
export const createUser = (payload) => User.create(payload);
export const createSession = (payload) => Session.create(payload);
export const deleteSessionByRefreshToken = (refreshToken) => Session.deleteOne({ refreshToken });
export const findSessionByRefreshToken = (refreshToken) => Session.findOne({ refreshToken });

