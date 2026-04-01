import mongoose from "mongoose";
import {
createRole,
findPermissionsByIds,
  listPermissions,
  listRoles,
  updateRoleById,
} from "./rbac.repository.js";
import { makeError } from "../../shared/errors/index.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);


export const listRolesService = async () => {
  const roles = await listRoles();
  return { status: 200, body: { roles } };
};

export const createRoleService = async (payload = {}) => {
  const { name, permissionIds } = payload;
  if (!name || typeof name !== "string") throw makeError(400, "Name is required");

  const cleanName = name.trim();
  if (!cleanName) throw makeError(400, "Name is required");

  let ids = [];
  if (Array.isArray(permissionIds)) {
    ids = Array.from(new Set(permissionIds));
    if (ids.some((id) => !isObjectId(id))) throw makeError(400, "Invalid permission id");
    const perms = await findPermissionsByIds(ids);
    if (perms.length !== ids.length) throw makeError(400, "Some permissionIds do not exist");
  }

  const role = await createRole({ name: cleanName, permissions: ids });
  await role.populate({ path: "permissions", select: "action resource" });
  return { status: 201, body: { role } };
};

export const updateRoleService = async (id, payload = {}) => {
  const { name, permissionIds } = payload;
  if (!isObjectId(id)) throw makeError(400, "Invalid role id");

  const update = {};
  if (typeof name === "string") {
    const cleanName = name.trim();
    if (!cleanName) throw makeError(400, "Name is required");
    update.name = cleanName;
  }

  if (Array.isArray(permissionIds)) {
    const ids = Array.from(new Set(permissionIds));
    if (ids.some((pid) => !isObjectId(pid))) throw makeError(400, "Invalid permission id");
    const perms = await findPermissionsByIds(ids);
    if (perms.length !== ids.length) throw makeError(400, "Some permissionIds do not exist");
    update.permissions = ids;
  }

  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const role = await updateRoleById(id, update);
  if (!role) throw makeError(404, "Role not found");
  return { status: 200, body: { role } };
};

export const listPermissionsService = async () => {
  const permissions = await listPermissions();
  return { status: 200, body: { permissions } };
};




