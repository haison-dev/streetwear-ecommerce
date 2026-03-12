import mongoose from "mongoose";
import Role from "../models/Role.js";
import User from "../models/User.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate({ path: "roles", select: "name" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("listUsers error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findById(id)
      .select("-password")
      .populate({ path: "roles", select: "name permissions" })
      .populate({ path: "roles.permissions", select: "action resource" });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("getUserById error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body || {};

    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid user id" });
    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ message: "roleIds must be an array" });
    }
    const uniqueRoleIds = Array.from(new Set(roleIds));
    if (uniqueRoleIds.some((roleId) => !isObjectId(roleId))) {
      return res.status(400).json({ message: "Invalid role id" });
    }

    const roles = await Role.find({ _id: { $in: uniqueRoleIds } }).select("_id");
    if (roles.length !== uniqueRoleIds.length) {
      return res.status(400).json({ message: "Some roleIds do not exist" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { roles: uniqueRoleIds },
      { new: true, runValidators: true, select: "-password" }
    ).populate({ path: "roles", select: "name" });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("updateUserRoles error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
