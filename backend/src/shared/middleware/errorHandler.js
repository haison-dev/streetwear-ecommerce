const shouldLogAsError = (status) => status >= 500;

export const errorHandler = (err, req, res, next) => {
  const status = err?.status || err?.statusCode || (err?.name === "CastError" ? 400 : 500);

  let message = err?.message || "Internal server error";
  if (err?.code === 11000) {
    message = "Duplicate value already exists";
  }

  if (shouldLogAsError(status)) {
    console.error(err);
  }

  if (res.headersSent) return next(err);
  return res.status(status).json({ message });
};

