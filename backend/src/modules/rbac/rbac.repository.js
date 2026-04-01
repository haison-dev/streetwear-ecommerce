import Permission from "../../models/Permission.js";
import Role from "../../models/Role.js";

export const listRoles = () =>
  Role.find().populate({ path: "permissions", select: "action resource" }).sort({ createdAt: -1 });

export const findPermissionsByIds = (ids) => Permission.find({ _id: { $in: ids } }).select("_id");
export const createRole = (payload) => Role.create(payload);

export const updateRoleById = (id, payload) =>
  Role.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).populate({
    path: "permissions",
    select: "action resource",
  });

export const listPermissions = () => Permission.find().sort({ createdAt: -1 });

