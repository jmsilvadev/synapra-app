import { apiClient } from "./apiClient";
import type { BillingProfile, Plan } from "../types/admin";

export type RegistrationPayload = {
  organization_name: string;
  email: string;
  plan_code: string;
  billing_profile: BillingProfile;
};

export type RegistrationResponse = {
  session_id: string;
  email: string;
  plan_code: string;
  status: string;
  expires_at: string;
};

export async function getPublicPlans() {
  const response = await apiClient.get<{ plans: Plan[] }>("/v1/public/plans");
  return Array.isArray(response.data?.plans) ? response.data.plans : [];
}

export async function startRegistration(payload: RegistrationPayload) {
  const response = await apiClient.post<RegistrationResponse>("/v1/public/register", payload);
  return response.data;
}
