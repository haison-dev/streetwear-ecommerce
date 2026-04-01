import User from "../../models/User.js";

export const findUserById = (id) => User.findById(id);
export const updateUserById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true, runValidators: true, select: "-password" });
export const saveUser = (user) => user.save();

