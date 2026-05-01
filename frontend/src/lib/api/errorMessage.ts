import { isAxiosError } from "axios";

export const getErrorMessage = (err: unknown, fallback = "Something went wrong.") => {
  if (isAxiosError(err)) {
    const msg = err.response?.data as { message?: string } | undefined;
    if (msg?.message && typeof msg.message === "string") {
      return msg.message;
    }
    if (typeof err.message === "string" && err.message) {
      return err.message;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
};
