import Role from "../../models/Role.js";
import User from "../../models/User.js";

export const listUsers = () =>
  User.find()
    .select("-password")
    .populate({ path: "roles", select: "name" })
    .sort({ createdAt: -1 });

export const findUserById = (id) =>
  User.findById(id)
    .select("-password")
    .populate({ path: "roles", select: "name permissions" })
    .populate({ path: "roles.permissions", select: "action resource" });

export const findRolesByIds = (ids) => Role.find({ _id: { $in: ids } }).select("_id");

export const updateUserRoles = (id, roleIds) =>
  User.findByIdAndUpdate(id, { roles: roleIds }, { new: true, runValidators: true, select: "-password" }).populate({
    path: "roles",
    select: "name",
  });

