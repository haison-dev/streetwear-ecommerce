import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { loginService, logoutService, meService, refreshTokenService, registerService } from "./auth.service.js";

const attachRefreshCookie = (res, refreshToken, maxAge) => {
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge });
};

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body || {});
  attachRefreshCookie(res, result.cookies.refreshToken, result.cookies.maxAge);
  return sendResult(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body || {});
  attachRefreshCookie(res, result.cookies.refreshToken, result.cookies.maxAge);
  return sendResult(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await logoutService(req.cookies?.refreshToken);
  if (result.clearCookie) res.clearCookie("refreshToken");
  return sendResult(res, result);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await refreshTokenService(req.cookies?.refreshToken);
  return sendResult(res, result);
});

export const me = asyncHandler(async (req, res) => {
  const result = await meService(req.user);
  return sendResult(res, result);
});

