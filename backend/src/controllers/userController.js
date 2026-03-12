import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("getMe error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body || {};

    const update = {};
    const hasFirst = typeof firstName === "string";
    const hasLast = typeof lastName === "string";
    if (hasFirst || hasLast) {
      if (!hasFirst || !hasLast) {
        return res.status(400).json({ message: "Both firstName and lastName are required" });
      }
      const nextFirst = firstName.trim();
      const nextLast = lastName.trim();
      update.displayName = `${nextLast} ${nextFirst}`.trim();
    }
    if (typeof phone === "string") update.phone = phone.trim();

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("updateMe error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.error("updateMyPassword error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
