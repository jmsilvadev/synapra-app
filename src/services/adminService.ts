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
  Membership,
  OrganizationRules,
  OrganizationSettings,
  Plan,
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
  provider: string;
  email?: string | null;
  name?: string | null;
  picture_url?: string | null;
}) {
  const response = await apiClient.post<AdminSession>("/v1/admin/auth/login", payload);
  return response.data;
}

export async function getCurrentAdminSession() {
  const response = await apiClient.get<AdminSession>("/v1/admin/me");
  return response.data;
}

export async function logoutAdmin() {
  await apiClient.post("/v1/admin/auth/logout");
}

export async function getClients() {
  const response = await apiClient.get<{ clients: Client[] }>("/v1/admin/clients");
  return asArray(response.data?.clients);
}

export async function createClient(payload: { name: string; plan: string }) {
  const response = await apiClient.post<Client>("/v1/admin/clients", payload);
  return response.data;
}

export async function getDashboard(clientId: string) {
  const response = await apiClient.get<DashboardResponse>("/v1/admin/dashboard", {
    params: { client_id: clientId },
  });
  return response.data;
}

export async function getPlans() {
  const response = await apiClient.get<{ plans: Plan[] }>("/v1/admin/plans");
  return asArray(response.data?.plans);
}

export async function upsertPlan(code: string, payload: Plan) {
  const response = await apiClient.put<Plan>(`/v1/admin/plans/${code}`, payload);
  return response.data;
}

export async function getOrganizationRules(clientId: string) {
  const response = await apiClient.get<OrganizationRules>(
    `/v1/admin/clients/${clientId}/rules/organization`
  );
  return response.data;
}

export async function updateOrganizationRules(clientId: string, rulesMarkdown: string) {
  const response = await apiClient.put<OrganizationRules>(
    `/v1/admin/clients/${clientId}/rules/organization`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function getWorkspaceRules(clientId: string, projectId: string, namespace: string) {
  const response = await apiClient.get<WorkspaceRules>(
    `/v1/admin/clients/${clientId}/rules/workspace`,
    {
      params: { project_id: projectId, namespace },
    }
  );
  return response.data;
}

export async function listWorkspaceRules(clientId: string) {
  const response = await apiClient.get<{ workspaces: WorkspaceRuleSummary[] }>(
    `/v1/admin/clients/${clientId}/rules/workspaces`
  );
  return asArray(response.data?.workspaces);
}

export async function updateWorkspaceRules(
  clientId: string,
  payload: { project_id: string; namespace: string; rules_markdown: string }
) {
  const response = await apiClient.put<WorkspaceRules>(
    `/v1/admin/clients/${clientId}/rules/workspace`,
    payload
  );
  return response.data;
}

export async function getClientApiKeys(clientId: string) {
  const response = await apiClient.get<{ api_keys: ApiKey[] }>(
    `/v1/admin/clients/${clientId}/api-keys`
  );
  return asArray(response.data?.api_keys);
}

export async function createClientApiKey(clientId: string, label: string) {
  const response = await apiClient.post<ApiKeyCreateResponse>(
    `/v1/admin/clients/${clientId}/api-keys`,
    { label }
  );
  return response.data;
}

export async function revokeClientApiKey(clientId: string, keyId: string) {
  await apiClient.delete(`/v1/admin/clients/${clientId}/api-keys/${keyId}`);
}

export async function getClientUsers(clientId: string) {
  const response = await apiClient.get<{ users: Array<{ membership: Membership } & AdminSession["user"]> }>(
    `/v1/admin/clients/${clientId}/users`
  );
  return asArray(response.data?.users);
}

export async function getClientInvitations(clientId: string) {
  const response = await apiClient.get<{ invitations: Array<{ id: string; email: string; role: string; expires_at: string; accepted_at?: string }> }>(
    `/v1/admin/clients/${clientId}/invitations`
  );
  return asArray(response.data?.invitations);
}

export async function createClientInvitation(clientId: string, email: string, role: string) {
  const response = await apiClient.post(`/v1/admin/invitations`, {
    organization_id: clientId,
    email,
    role,
  });
  return response.data;
}

export async function getAuditLogs(clientId: string) {
  const response = await apiClient.get<{ logs: AuditLogRecord[] }>("/v1/admin/logs/audit", {
    params: { client_id: clientId, limit: 20 },
  });
  return asArray(response.data?.logs);
}

export async function getOrganizationSettings(clientId: string) {
  const response = await apiClient.get<OrganizationSettings>(
    `/v1/admin/clients/${clientId}/settings`
  );
  return response.data;
}

export async function getBillingProfile(clientId: string) {
  const response = await apiClient.get<BillingProfile>(
    `/v1/admin/clients/${clientId}/billing/profile`
  );
  return response.data;
}

export async function getSubscription(clientId: string) {
  const response = await apiClient.get<Subscription>(
    `/v1/admin/clients/${clientId}/billing/subscription`
  );
  return response.data;
}

export async function getInvoices(clientId: string) {
  const response = await apiClient.get<{ invoices: InvoiceRecord[] }>(
    `/v1/admin/clients/${clientId}/billing/invoices`
  );
  return asArray(response.data?.invoices);
}
