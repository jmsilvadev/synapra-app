import { apiClient } from "./apiClient";

export interface CheckoutSession {
  session_id: string;
  url: string;
}

export interface BillingPortalSession {
  url: string;
}

export async function createSubscriptionCheckout(): Promise<CheckoutSession> {
  const response = await apiClient.post<CheckoutSession>("/v1/billing/subscription/checkout");
  return response.data;
}

export async function createAddonCheckout(addonCode: string, quantity: number = 1): Promise<CheckoutSession> {
  const response = await apiClient.post<CheckoutSession>("/v1/billing/addons/checkout", {
    addon_code: addonCode,
    quantity,
  });
  return response.data;
}

export async function getBillingPortal(): Promise<BillingPortalSession> {
  const response = await apiClient.get<BillingPortalSession>("/v1/billing/portal");
  return response.data;
}