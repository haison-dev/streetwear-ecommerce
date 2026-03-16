import cloudinary from "../libs/cloudinary.js";

const CLOUDINARY_UPLOAD_TIMEOUT_MS = Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || 60000);

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", timeout: CLOUDINARY_UPLOAD_TIMEOUT_MS, ...options },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    stream.end(buffer);
  });

const isTimeoutError = (error) =>
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
      if (!isTimeoutError(error) || attempt === maxRetries) {
        throw error;
      }
    }
  }
  throw lastError;
};

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const folder = req.body?.folder || "e-commerce/products";
    const uploads = await Promise.all(
      req.files.map((file) => uploadWithRetry(file.buffer, { folder }))
    );

    const images = uploads.map((item) => ({
      url: item.secure_url,
      publicId: item.public_id,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
    }));

    return res.status(201).json({ images });
  } catch (error) {
    console.error("uploadImages error", error);
    const timeout = isTimeoutError(error);
    return res.status(timeout ? 504 : 500).json({
      message: "Image upload failed",
      error: timeout
        ? "Cloud upload timeout. Please try again with a smaller image or check network."
        : error?.message || "Unknown error",
    });
  }
};
