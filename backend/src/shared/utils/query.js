export const normalizeOptionalId = (value) => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;

  const lower = text.toLowerCase();
  if (lower === "undefined" || lower === "null" || lower === "all") {
    return undefined;
  }

  return text;
};

