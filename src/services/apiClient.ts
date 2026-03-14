import axios from "axios";

export const apiBaseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: apiBaseURL,
});

export function setAdminToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete apiClient.defaults.headers.common.Authorization;
}

export function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { error?: string } | undefined)?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
