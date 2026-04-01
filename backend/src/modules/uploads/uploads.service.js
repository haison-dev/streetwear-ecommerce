import { uploadBuffer } from "./uploads.repository.js";
import { makeError } from "../../shared/errors/index.js";



export const isTimeoutError = (error) =>
  error?.name === "TimeoutError" ||
  error?.http_code === 499 ||
  /timeout/i.test(String(error?.message || ""));

const uploadWithRetry = async (buffer, options = {}, maxRetries = 1) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await uploadBuffer(buffer, options);
    } catch (error) {
      lastError = error;
      if (!isTimeoutError(error) || attempt === maxRetries) throw error;
    }
  }
  throw lastError;
};

export const uploadImagesService = async ({ files, folder }) => {
  if (!files || !files.length) throw makeError(400, "No images uploaded");

  const uploads = await Promise.all(files.map((file) => uploadWithRetry(file.buffer, { folder })));

  const images = uploads.map((item) => ({
    url: item.secure_url,
    publicId: item.public_id,
    width: item.width,
    height: item.height,
    format: item.format,
    bytes: item.bytes,
  }));

  return { status: 201, body: { images } };
};




