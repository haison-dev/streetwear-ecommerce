import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../libs/db.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

dotenv.config();

const PAYMENT_PERMISSIONS = [
  { action: "read", resource: "payment" },
  { action: "write", resource: "payment" },
];

const DEFAULT_ROLE_NAMES = ["admin", "staff"];

const normalizeRoleNames = () => {
  const raw = String(process.env.PAYMENT_PERMISSION_ROLE_NAMES || "").trim();
  if (!raw) return DEFAULT_ROLE_NAMES;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const run = async () => {
  await connectDB();
  const roleNames = normalizeRoleNames();

  const permissionIds = [];
  for (const perm of PAYMENT_PERMISSIONS) {
    const doc = await Permission.findOneAndUpdate(
      { action: perm.action, resource: perm.resource },
      { $setOnInsert: perm },
      { upsert: true, new: true },
    );
    permissionIds.push(doc._id);
  }

  const roles = await Role.find({ name: { $in: roleNames } });
  for (const role of roles) {
    const current = new Set((role.permissions || []).map((id) => String(id)));
    for (const permissionId of permissionIds) {
      current.add(String(permissionId));
    }
    role.permissions = Array.from(current);
    await role.save();
  }

  console.log(
    `Seeded payment permissions and synced roles: ${roles.map((r) => r.name).join(", ") || "(none)"}`,
  );
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("seed-payment-permissions failed", err);
    await mongoose.disconnect();
    process.exit(1);
  });
