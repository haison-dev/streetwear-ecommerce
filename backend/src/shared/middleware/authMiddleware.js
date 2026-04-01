import jwt from "jsonwebtoken";
import User from "../../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Access token is missing" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate({
        path: "roles",
        populate: { path: "permissions", select: "action resource" },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const permissions = new Set();
    for (const role of user.roles || []) {
      for (const permission of role?.permissions || []) {
        if (permission?.action && permission?.resource) {
          permissions.add(`${permission.action}:${permission.resource}`);
        }
      }
    }

    req.user = user;
    req.userPermissions = permissions;
    next();
  } catch (error) {
    const isJwt = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
    return res.status(isJwt ? 403 : 500).json({
      message: isJwt ? "Access token expired or invalid" : "Internal server error",
    });
  }
};

export const authorize = (resource, action) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const key = `${action}:${resource}`;
  if (!req.userPermissions?.has(key)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};


