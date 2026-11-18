import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<{ message?: string }>(error)) return fallback;
  const message = error.response?.data?.message;
  return typeof message === "string" && message ? message : fallback;
};
