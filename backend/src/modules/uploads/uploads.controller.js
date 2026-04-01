import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { uploadImagesService } from "./uploads.service.js";

export const uploadImages = asyncHandler(async (req, res) => {
  const result = await uploadImagesService({
    files: req.files,
    folder: req.body?.folder || "e-commerce/products",
  });
  return sendResult(res, result);
});

