import cloudinary from "../libs/cloudinary.js";

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    stream.end(buffer);
  });

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const folder = req.body?.folder || "e-commerce/products";
    const uploads = await Promise.all(
      req.files.map((file) => uploadBuffer(file.buffer, { folder }))
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
    return res.status(500).json({
      message: "Image upload failed",
      error: error?.message || "Unknown error",
    });
  }
};
