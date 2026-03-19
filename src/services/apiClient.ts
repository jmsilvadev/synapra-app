import axios from "axios";

export const apiBaseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";
export const siteURL = process.env.REACT_APP_SITE_URL || "https://elastra.ai";

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
    if (fallback) {
      return fallback;
    }
    switch (error.response?.status) {
      case 400:
        return "We could not process your request. Please review the provided data and try again.";
      case 401:
        return "Your session is invalid or expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 409:
        return "This action could not be completed because it conflicts with existing data.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "Something went wrong while processing your request. Please try again.";
    }
  }
  if (error instanceof Error) {
    return fallback || "Something went wrong while processing your request. Please try again.";
  }
  return fallback || "Something went wrong while processing your request. Please try again.";
}
