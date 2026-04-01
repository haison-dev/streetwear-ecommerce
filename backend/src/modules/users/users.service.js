import bcrypt from "bcrypt";
import { findUserById, saveUser, updateUserById } from "./users.repository.js";
import { makeError } from "../../shared/errors/index.js";



export const getMeService = async (user) => ({ status: 200, body: { user } });

export const updateMeService = async (userId, payload = {}) => {
  const { firstName, lastName, phone } = payload;
  const update = {};

  const hasFirst = typeof firstName === "string";
  const hasLast = typeof lastName === "string";
  if (hasFirst || hasLast) {
    if (!hasFirst || !hasLast) throw makeError(400, "Both firstName and lastName are required");
    update.displayName = `${lastName.trim()} ${firstName.trim()}`.trim();
  }
  if (typeof phone === "string") update.phone = phone.trim();
  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const user = await updateUserById(userId, update);
  if (!user) throw makeError(404, "User not found");
  return { status: 200, body: { user } };
};

export const updateMyPasswordService = async (userId, payload = {}) => {
  const { currentPassword, newPassword } = payload;
  if (!currentPassword || !newPassword) {
    throw makeError(400, "Current and new password are required");
  }

  const user = await findUserById(userId);
  if (!user) throw makeError(404, "User not found");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw makeError(401, "Current password is incorrect");
  if (currentPassword === newPassword) throw makeError(400, "New password must be different");

  user.password = await bcrypt.hash(newPassword, 10);
  await saveUser(user);
  return { status: 200, body: { message: "Password updated" } };
};




