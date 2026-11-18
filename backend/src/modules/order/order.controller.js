import { forbidden, unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createOrderFromCartService,
  getOrderByIdService,
  listOrdersService,
  quoteOrderFromCartService,
  updateOrderStatusService,
} from "./order.service.js";

export const quoteOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const { city = "", couponCode = "" } = req.body || {};
  return sendResult(res, await quoteOrderFromCartService({ userId, city, couponCode }));
});

export const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await createOrderFromCartService({
    userId,
    payload: req.body || {},
  });

  return sendResult(res, result);
});

export const listOrders = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const hasOrderPermission =
    req.userPermissions?.has("read:order") ||
    req.userPermissions?.has("write:order");
  if (req.query.scope === "operations" && !hasOrderPermission) throw forbidden();
  const canReadAllOrders = req.query.scope !== "mine" && hasOrderPermission;
  const result = await listOrdersService({
    userId,
    query: req.query || {},
    canReadAllOrders,
    includeOrderActions: req.query.scope === "operations" && req.userPermissions?.has("write:order"),
  });

  return sendResult(res, result);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const canReadAllOrders =
    req.userPermissions?.has("read:order") ||
    req.userPermissions?.has("write:order");
  const result = await getOrderByIdService({
    orderId: req.params.id,
    userId,
    canReadAllOrders: req.query.scope !== "mine" && canReadAllOrders,
  });

  return sendResult(res, result);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await updateOrderStatusService({
    orderId: req.params.id,
    nextStatus: req.body?.status,
  });

  return sendResult(res, result);
});
