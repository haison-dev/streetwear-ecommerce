export const normalizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const normalizeEmail = (value) => normalizeString(value).toLowerCase();

export const slugify = (value) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toNumber = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

