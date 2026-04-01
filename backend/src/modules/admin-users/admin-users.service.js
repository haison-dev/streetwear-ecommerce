import mongoose from "mongoose";
import {
findRolesByIds,
findUserById,
  listUsers,
  updateUserRoles,
} from "./admin-users.repository.js";
import { makeError } from "../../shared/errors/index.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);


export const listUsersService = async () => {
  const users = await listUsers();
  return { status: 200, body: { users } };
};

export const getUserByIdService = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid user id");
  const user = await findUserById(id);
  if (!user) throw makeError(404, "User not found");
  return { status: 200, body: { user } };
};

export const updateUserRolesService = async (id, payload = {}) => {
  const { roleIds } = payload;
  if (!isObjectId(id)) throw makeError(400, "Invalid user id");
  if (!Array.isArray(roleIds)) throw makeError(400, "roleIds must be an array");

  const uniqueRoleIds = Array.from(new Set(roleIds));
  if (uniqueRoleIds.some((roleId) => !isObjectId(roleId))) throw makeError(400, "Invalid role id");

  const roles = await findRolesByIds(uniqueRoleIds);
  if (roles.length !== uniqueRoleIds.length) throw makeError(400, "Some roleIds do not exist");

  const user = await updateUserRoles(id, uniqueRoleIds);
  if (!user) throw makeError(404, "User not found");
  return { status: 200, body: { user } };
};




