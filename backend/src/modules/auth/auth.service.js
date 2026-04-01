import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import validator from "validator";
import {
createSession,
createUser,
  deleteSessionByRefreshToken,
  findRawUserByEmail,
  findSessionByRefreshToken,
  findUserByEmail,
} from "./auth.repository.js";
import { makeError } from "../../shared/errors/index.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;


const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

export const registerService = async (payload = {}) => {
  const { email, password, firstName, lastName, phone } = payload;
  if (!email || !password || !firstName || !lastName) {
    throw makeError(400, "First name, last name, email, and password are required.");
  }
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) throw makeError(400, "Invalid email!");

  const duplicate = await findRawUserByEmail(normalizedEmail);
  if (duplicate) throw makeError(409, "Email already exist!");

  const hashPassword = await bcrypt.hash(password, 10);
  const displayName = `${(lastName || "").trim()} ${(firstName || "").trim()}`.trim();

  const user = await createUser({
    email: normalizedEmail,
    password: hashPassword,
    displayName,
    phone: (phone || "").trim(),
  });

  const accessToken = signAccessToken(user._id);
  const refreshToken = crypto.randomBytes(64).toString("hex");

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  return {
    status: 201,
    body: {
      token: accessToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, roles: user.roles || [] },
    },
    cookies: { refreshToken, maxAge: REFRESH_TOKEN_TTL },
  };
};

export const loginService = async (payload = {}) => {
  const { email, password } = payload;
  if (!email || !password) throw makeError(400, "All fields are required.");

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) throw makeError(400, "Invalid email!");

  const user = await findUserByEmail(normalizedEmail);
  if (!user) throw makeError(401, "Email or password is incorrect");

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) throw makeError(401, "Email or password is incorrect");

  const accessToken = signAccessToken(user._id);
  const refreshToken = crypto.randomBytes(64).toString("hex");

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  const roles = (user.roles || []).map((role) => role._id);
  const roleNames = (user.roles || []).map((role) => (role?.name || "").toString().toLowerCase()).filter(Boolean);

  return {
    status: 200,
    body: { token: accessToken, user: { id: user._id, email: user.email, displayName: user.displayName, roles, roleNames } },
    cookies: { refreshToken, maxAge: REFRESH_TOKEN_TTL },
  };
};

export const logoutService = async (token) => {
  if (token) await deleteSessionByRefreshToken(token);
  return { status: 204, body: null, clearCookie: Boolean(token) };
};

export const refreshTokenService = async (token) => {
  if (!token) throw makeError(401, "Token is not available");

  const session = await findSessionByRefreshToken(token);
  if (!session) throw makeError(403, "Invalid token or expired");
  if (session.expiresAt < new Date()) throw makeError(403, "Token has expired");

  return { status: 200, body: { accessToken: signAccessToken(session.userId) } };
};

export const meService = async (user) => ({ status: 200, body: { user } });




