import { apiClient } from "./apiClient";
import type {
  AdminSession,
  ApiKey,
  ApiKeyCreateResponse,
  AuditLogRecord,
  AuditActionStats,
  BillingProfile,
  Client,
  DashboardSummary,
  InvoiceRecord,
  OrganizationRules,
  OrganizationSettings,
  Subscription,
  Usage,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Namespace,
  CreateNamespaceRequest,
  Repository,
  CreateRepositoryRequest,
  ProjectRules,
  ProjectRuleSummary,
  NamespaceRules,
  NamespaceRuleSummary,
  RepositoryRules,
  RepositoryRuleSummary,
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

export async function getAuditLogs(clientId: string, action?: string, startDate?: string, endDate?: string, limit = 20, offset = 0) {
  const params: Record<string, string> = { client_id: clientId, limit: String(limit), offset: String(offset) };
  if (action) {
    params.action = action;
  }
  if (startDate) {
    params.start_date = startDate;
  }
  if (endDate) {
    params.end_date = endDate;
  }
  const response = await apiClient.get<{ logs: AuditLogRecord[] }>("/v1/console/logs/audit", {
    params,
  });
  return asArray(response.data?.logs);
}

export async function getAuditActionStats(clientId: string) {
  const response = await apiClient.get<{ stats: AuditActionStats[] }>("/v1/console/logs/stats", {
    params: { client_id: clientId },
  });
  return asArray(response.data?.stats);
}

export async function getSynapraMetrics(clientId: string) {
  const response = await apiClient.get<{ metrics: SynapraMetrics }>("/v1/console/synapra/metrics", {
    params: { client_id: clientId },
  });
  return response.data?.metrics;
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

export async function getProjects(clientId: string) {
  const response = await apiClient.get<{ projects: Project[] }>(
    `/v1/console/clients/${clientId}/projects`
  );
  return asArray(response.data?.projects);
}

export async function createProject(clientId: string, payload: CreateProjectRequest) {
  const response = await apiClient.post<Project>(
    `/v1/console/clients/${clientId}/projects`,
    payload
  );
  return response.data;
}

export async function getProject(clientId: string, projectId: string) {
  const response = await apiClient.get<Project>(
    `/v1/console/clients/${clientId}/projects/${projectId}`
  );
  return response.data;
}

export async function updateProject(clientId: string, projectId: string, payload: UpdateProjectRequest) {
  const response = await apiClient.put<Project>(
    `/v1/console/clients/${clientId}/projects/${projectId}`,
    payload
  );
  return response.data;
}

export async function deleteProject(clientId: string, projectId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/projects/${projectId}`);
}

export async function getNamespaces(clientId: string, projectId: string) {
  const response = await apiClient.get<{ namespaces: Namespace[] }>(
    `/v1/console/clients/${clientId}/namespaces`,
    { params: { project_id: projectId } }
  );
  return asArray(response.data?.namespaces);
}

export async function createNamespace(clientId: string, payload: CreateNamespaceRequest) {
  const response = await apiClient.post<Namespace>(
    `/v1/console/clients/${clientId}/namespaces`,
    payload
  );
  return response.data;
}

export async function deleteNamespace(clientId: string, namespaceId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/namespaces/${namespaceId}`);
}

export async function getRepositories(clientId: string, projectId?: string) {
  const params = projectId ? { project_id: projectId } : {};
  const response = await apiClient.get<{ repositories: Repository[] }>(
    `/v1/console/clients/${clientId}/repositories`,
    { params }
  );
  return asArray(response.data?.repositories);
}

export async function createRepository(clientId: string, payload: CreateRepositoryRequest) {
  const response = await apiClient.post<Repository>(
    `/v1/console/clients/${clientId}/repositories`,
    payload
  );
  return response.data;
}

export async function getRepository(clientId: string, repositoryId: string) {
  const response = await apiClient.get<Repository>(
    `/v1/console/clients/${clientId}/repositories/${repositoryId}`
  );
  return response.data;
}

export async function deleteRepository(clientId: string, repositoryId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/repositories/${repositoryId}`);
}

export async function getProjectRules(clientId: string, projectUuid: string) {
  const response = await apiClient.get<ProjectRules>(
    `/v1/console/clients/${clientId}/rules/projects/${projectUuid}`
  );
  return response.data;
}

export async function listProjectRules(clientId: string) {
  const response = await apiClient.get<{ projects: ProjectRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/projects`
  );
  return asArray(response.data?.projects);
}

export async function updateProjectRules(clientId: string, projectUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<ProjectRules>(
    `/v1/console/clients/${clientId}/rules/projects/${projectUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteProjectRules(clientId: string, projectUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/projects/${projectUuid}`);
}

export async function getNamespaceRules(clientId: string, namespaceUuid: string) {
  const response = await apiClient.get<NamespaceRules>(
    `/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`
  );
  return response.data;
}

export async function listNamespaceRules(clientId: string) {
  const response = await apiClient.get<{ namespaces: NamespaceRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/namespaces`
  );
  return asArray(response.data?.namespaces);
}

export async function updateNamespaceRules(clientId: string, namespaceUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<NamespaceRules>(
    `/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteNamespaceRules(clientId: string, namespaceUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`);
}

export async function getRepositoryRules(clientId: string, repositoryUuid: string) {
  const response = await apiClient.get<RepositoryRules>(
    `/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`
  );
  return response.data;
}

export async function listRepositoryRules(clientId: string) {
  const response = await apiClient.get<{ repositories: RepositoryRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/repositories`
  );
  return asArray(response.data?.repositories);
}

export async function updateRepositoryRules(clientId: string, repositoryUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<RepositoryRules>(
    `/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteRepositoryRules(clientId: string, repositoryUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`);
}
