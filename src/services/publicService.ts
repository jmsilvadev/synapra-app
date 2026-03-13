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
  email_sent: boolean;
};

export type RegistrationVerifyResponse = {
  session: {
    id: string;
    organization_id?: string;
    organization_name: string;
    email: string;
    plan_code: string;
    status: string;
    expires_at: string;
    verified_at?: string;
    completed_at?: string;
  };
  plan: Plan;
};

export type RegistrationCompleteResponse = {
  organization_id: string;
  organization_name: string;
  plan_code: string;
  bootstrap_api_key: string;
  subscription: {
    organization_id: string;
    plan_code: string;
    provider: string;
    status: string;
    current_period_start?: string;
    current_period_end?: string;
    trial_ends_at?: string;
    cancel_at_period_end: boolean;
  };
};

export async function getPublicPlans() {
  const response = await apiClient.get<{ plans: Plan[] }>("/v1/public/plans");
  return Array.isArray(response.data?.plans) ? response.data.plans : [];
}

export async function startRegistration(payload: RegistrationPayload) {
  const response = await apiClient.post<RegistrationResponse>("/v1/public/register", payload);
  return response.data;
}

export async function verifyRegistration(token: string) {
  const response = await apiClient.get<RegistrationVerifyResponse>("/v1/public/register/verify", {
    params: { token },
  });
  return response.data;
}

export async function completeRegistration(token: string) {
  const response = await apiClient.post<RegistrationCompleteResponse>("/v1/public/register/complete", {
    token,
  });
  return response.data;
}
