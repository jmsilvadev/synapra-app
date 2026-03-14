import { apiClient } from "./apiClient";
import type {
  AdminSession,
  ApiKey,
  ApiKeyCreateResponse,
  AuditLogRecord,
  BillingProfile,
  Client,
  DashboardSummary,
  InvoiceRecord,
  OrganizationRules,
  OrganizationSettings,
  Subscription,
  Usage,
  WorkspaceRuleSummary,
  WorkspaceRules,
} from "../types/admin";

export type DashboardResponse = {
  client: Client;
  summary: DashboardSummary;
  usage: Usage;
  subscription?: Subscription;
};

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export async function loginAdminWithFirebase(payload: {
  id_token: string;
  email?: string | null;
  name?: string | null;
  picture_url?: string | null;
}) {
  const response = await apiClient.post<AdminSession>("/v1/console/auth/login", payload);
  return response.data;
}

export async function getCurrentAdminSession() {
  const response = await apiClient.get<AdminSession>("/v1/console/me");
  return response.data;
}

export async function logoutAdmin() {
  await apiClient.post("/v1/console/auth/logout");
}

export async function getClients() {
  const response = await apiClient.get<{ clients: Client[] }>("/v1/console/clients");
  return asArray(response.data?.clients);
}

export async function updateClient(clientId: string, payload: { name?: string; plan?: string }) {
  const response = await apiClient.put<Client>(`/v1/console/clients/${clientId}`, payload);
  return response.data;
}

export async function getDashboard(clientId: string) {
  const response = await apiClient.get<DashboardResponse>("/v1/console/dashboard", {
    params: { client_id: clientId },
  });
  return response.data;
}

export async function getOrganizationRules(clientId: string) {
  const response = await apiClient.get<OrganizationRules>(
    `/v1/console/clients/${clientId}/rules/organization`
  );
  return response.data;
}

export async function updateOrganizationRules(clientId: string, rulesMarkdown: string) {
  const response = await apiClient.put<OrganizationRules>(
    `/v1/console/clients/${clientId}/rules/organization`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function getWorkspaceRules(clientId: string, projectId: string, namespace: string) {
  const response = await apiClient.get<WorkspaceRules>(
    `/v1/console/clients/${clientId}/rules/workspace`,
    {
      params: { project_id: projectId, namespace },
    }
  );
  return response.data;
}

export async function listWorkspaceRules(clientId: string) {
  const response = await apiClient.get<{ workspaces: WorkspaceRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/workspaces`
  );
  return asArray(response.data?.workspaces);
}

export async function updateWorkspaceRules(
  clientId: string,
  payload: { project_id: string; namespace: string; rules_markdown: string }
) {
  const response = await apiClient.put<WorkspaceRules>(
    `/v1/console/clients/${clientId}/rules/workspace`,
    payload
  );
  return response.data;
}

export async function deleteWorkspaceRules(clientId: string, projectId: string, namespace: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/workspace`, {
    params: { project_id: projectId, namespace },
  });
}

export async function getClientApiKeys(clientId: string) {
  const response = await apiClient.get<{ api_keys: ApiKey[] }>(
    `/v1/console/clients/${clientId}/api-keys`
  );
  return asArray(response.data?.api_keys);
}

export async function createClientApiKey(clientId: string, label: string) {
  const response = await apiClient.post<ApiKeyCreateResponse>(
    `/v1/console/clients/${clientId}/api-keys`,
    { label }
  );
  return response.data;
}

export async function revokeClientApiKey(clientId: string, keyId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/api-keys/${keyId}`);
}

export async function getAuditLogs(clientId: string) {
  const response = await apiClient.get<{ logs: AuditLogRecord[] }>("/v1/console/logs/audit", {
    params: { client_id: clientId, limit: 20 },
  });
  return asArray(response.data?.logs);
}

export async function getOrganizationSettings(clientId: string) {
  const response = await apiClient.get<OrganizationSettings>(
    `/v1/console/clients/${clientId}/settings`
  );
  return response.data;
}

export async function updateOrganizationSettings(clientId: string, payload: OrganizationSettings) {
  const response = await apiClient.put<OrganizationSettings>(
    `/v1/console/clients/${clientId}/settings`,
    payload
  );
  return response.data;
}

export async function getBillingProfile(clientId: string) {
  const response = await apiClient.get<BillingProfile>(
    `/v1/console/clients/${clientId}/billing/profile`
  );
  return response.data;
}

export async function updateBillingProfile(clientId: string, payload: BillingProfile) {
  const response = await apiClient.put<BillingProfile>(
    `/v1/console/clients/${clientId}/billing/profile`,
    payload
  );
  return response.data;
}

export async function getSubscription(clientId: string) {
  const response = await apiClient.get<Subscription>(
    `/v1/console/clients/${clientId}/billing/subscription`
  );
  return response.data;
}

export async function getInvoices(clientId: string) {
  const response = await apiClient.get<{ invoices: InvoiceRecord[] }>(
    `/v1/console/clients/${clientId}/billing/invoices`
  );
  return asArray(response.data?.invoices);
}
