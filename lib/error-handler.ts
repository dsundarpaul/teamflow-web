import { toast } from "sonner";
import { AxiosError } from "axios";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    
    if (typeof message === "string") {
      return message;
    }
    
    if (error.response?.status === 401) {
      return "Unauthorized. Please login again.";
    }
    
    if (error.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }
    
    if (error.response?.status === 404) {
      return "Resource not found.";
    }
    
    if (error.response?.status === 409) {
      return "Conflict. This resource already exists.";
    }
    
    if (error.response?.status >= 500) {
      return "Server error. Please try again later.";
    }
    
    return error.message || "An unexpected error occurred";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}

export function showErrorToast(error: unknown, defaultMessage?: string) {
  const message = handleApiError(error);
  toast.error(defaultMessage || message);
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showInfoToast(message: string) {
  toast.info(message);
}

