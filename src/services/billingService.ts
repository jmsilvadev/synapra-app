import { apiClient } from "./apiClient";

export interface CheckoutSession {
  session_id: string;
  url: string;
}

export interface BillingPortalSession {
  url: string;
}

export interface CheckoutRequest {
  price_id?: string;
}

export async function createSubscriptionCheckout(organizationId: string, priceId?: string): Promise<CheckoutSession> {
  const response = await apiClient.post<CheckoutSession>(`/v1/console/clients/${organizationId}/billing/checkout`, {
    price_id: priceId,
  } as CheckoutRequest);
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
  const response = await apiClient.post<BillingPortalSession>("/v1/console/billing/portal");
  return response.data;
}