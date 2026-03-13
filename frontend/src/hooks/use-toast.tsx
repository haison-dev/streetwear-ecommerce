import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
};

export const toast = ({ title, description, action, duration }: ToastOptions) => {
  return sonnerToast(title ?? "", {
    description,
    action,
    duration,
  });
};

export const dismiss = (toastId?: string | number) => {
  if (toastId === undefined) {
    sonnerToast.dismiss();
    return;
  }
  sonnerToast.dismiss(toastId);
};

export const useToast = () => {
  return {
    toast,
    dismiss,
  };
};
