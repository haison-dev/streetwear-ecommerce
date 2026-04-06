import { unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createOrderFromCartService,
  getOrderByIdService,
  listOrdersService,
  updateOrderStatusService,
} from "./order.service.js";

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

  const canReadAllOrders =
    req.userPermissions?.has("read:order") ||
    req.userPermissions?.has("write:order");
  const result = await listOrdersService({
    userId,
    query: req.query || {},
    canReadAllOrders,
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
    canReadAllOrders,
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
