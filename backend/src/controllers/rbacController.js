import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate({ path: "permissions", select: "action resource" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ roles });
  } catch (error) {
    console.error("listRoles error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body || {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name is required" });
    }

    const cleanName = name.trim();
    if (!cleanName) return res.status(400).json({ message: "Name is required" });

    let ids = [];
    if (Array.isArray(permissionIds)) {
      ids = Array.from(new Set(permissionIds));
      if (ids.some((id) => !isObjectId(id))) {
        return res.status(400).json({ message: "Invalid permission id" });
      }
      const perms = await Permission.find({ _id: { $in: ids } }).select("_id");
      if (perms.length !== ids.length) {
        return res.status(400).json({ message: "Some permissionIds do not exist" });
      }
    }

    const role = await Role.create({ name: cleanName, permissions: ids });
    await role.populate({ path: "permissions", select: "action resource" });
    return res.status(201).json({ role });
  } catch (error) {
    console.error("createRole error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissionIds } = req.body || {};
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid role id" });

    const update = {};

    if (typeof name === "string") {
      const cleanName = name.trim();
      if (!cleanName) return res.status(400).json({ message: "Name is required" });
      update.name = cleanName;
    }

    if (Array.isArray(permissionIds)) {
      const ids = Array.from(new Set(permissionIds));
      if (ids.some((pid) => !isObjectId(pid))) {
        return res.status(400).json({ message: "Invalid permission id" });
      }
      const perms = await Permission.find({ _id: { $in: ids } }).select("_id");
      if (perms.length !== ids.length) {
        return res.status(400).json({ message: "Some permissionIds do not exist" });
      }
      update.permissions = ids;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const role = await Role.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate({ path: "permissions", select: "action resource" });

    if (!role) return res.status(404).json({ message: "Role not found" });
    return res.status(200).json({ role });
  } catch (error) {
    console.error("updateRole error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: -1 });
    return res.status(200).json({ permissions });
  } catch (error) {
    console.error("listPermissions error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
